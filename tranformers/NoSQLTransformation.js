const fs = require('fs');
const axios = require('axios');
const getType = require('../utils/getTypeName');
const isCustomType = require('../utils/isCustomType');
const deleteFolder = require('../utils/deleteFolder');
const removeSquareBrackets = require('../utils/removeSquareBrackets');
const isObject = require('../utils/isObject');

const folder = './interfaces-nosql';
let timeBefore;
let filesWritten = 0;
let maxLength = 0;
let folderPath = folder;
let className = '';
let cycles = 0;

const interfaces = [];
const classNames = [];

const generateCode = () => {
    timeBefore = new Date().getTime();
    if (fs.existsSync(folder)) {
        deleteFolder(folder);
    }
    console.log('Reading database files...');

    fetchData();
};

const fetchData = async () => {
    const res = await axios.get('http://localhost:5000/api/db-structure');
    console.log('Writing interface files...');
    while (cycles < 1000) {
        parseJSON(res.data);
        cycles++;
    }
};

const parseJSON = (json) => {
    for (let i = 0; i < json.schemas.length; i++) {
        maxLength += json.schemas[i].tables.length;
    }
    for (const schema of json.schemas) {
        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                if (schema[key] instanceof Array) {
                    loopOverTable(schema[key]);
                } else if (typeof schema[key] === 'string') {
                    folderPath = folder + `/${schema.schemaName.toLowerCase()}`;
                }
            }
        }
    }
};

const loopOverTable = (tables) => {
    for (const table of tables) {
        filesWritten++;

        for (const key in table) {
            if (table.hasOwnProperty(key)) {
                if (table[key] instanceof Array) {
                    extractProperties(table[key]);
                } else if (typeof table[key] === 'string') {
                    className = 'I' + table[key];
                    classNames.push(className);
                }
            }
        }
    }
};

const extractProperties = (table) => {
    const bodies = [];
    const imports = [];
    const anyTypes = [];
    let usedImps = '';
    let properties = '';
    let firstColumn = true;

    for (const column of table) {
        for (const key in column) {
            if (column.hasOwnProperty(key)) {
                if (firstColumn) properties += key + ', ';
                const type = isObject(getType(typeof column[key]), column[key], interfaces, classNames);
                if (type.includes('any')) anyTypes.push(key);
                else if (firstColumn) bodies.push(`\t${toCamelCase(key)}: ${type}`);
                else if (!firstColumn && !properties.includes(key)) bodies.push(`\t${toCamelCase(key)}?: ${type}`);
                else {
                    for (let i = 0; i < anyTypes.length; i++) {
                        if (anyTypes[i] === key) {
                            bodies.push(`\t${toCamelCase(key)}: I${type}`);
                        }
                    }
                }

                if (isCustomType(removeSquareBrackets(type)) && !usedImps.includes(removeSquareBrackets(type))) {
                    usedImps += removeSquareBrackets(type);
                    imports.push(
                        `import { I${removeSquareBrackets(type)} } from \'./I${removeSquareBrackets(type)}\';\n`,
                    );
                }
            }
        }
        interfaces.push(properties);
        firstColumn = false;
    }

    const shouldPrint = !!(filesWritten === maxLength * cycles);

    if (imports.length > 0) {
        imports.sort();
        imports.push('\n');
    }
    formatFiles(bodies, imports, shouldPrint);
};

const formatFiles = (bodies, imports, shouldPrint) => {
    let lines = '';
    for (const imp of imports) {
        lines += imp;
    }

    lines += `export interface ${className} {`;
    let opts = '';
    for (const body of bodies.sort()) {
        if (body.includes('?')) opts += `\n${body};`;
        else lines += `\n${body};`;
    }
    lines += opts;
    lines += '\n}\n';
    writeFile(lines, shouldPrint);
};

const writeFile = (lines, shouldPrint) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    if (fs.existsSync(folder) && !fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    fs.writeFile(`${folderPath}/${className}.ts`, lines, (err) => {
        if (err) return console.log('2: ', err);

        if (shouldPrint) {
            const timeAfter = new Date().getTime();
            const timeElapsed = timeAfter - timeBefore;
            console.log(`Wrote ${filesWritten} files in ${timeElapsed}ms`);
        }
    });
};

function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

module.exports = () => {
    generateCode();
};
