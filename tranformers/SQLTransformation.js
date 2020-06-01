const fs = require('fs');
const axios = require('axios');
const getType = require('../utils/getTypeName');
const isCustomType = require('../utils/isCustomType');
const deleteFolder = require('../utils/deleteFolder');
const removeSquareBrackets = require('../utils/removeSquareBrackets');

const folder = './interfaces-sql';
let timeBefore;

function findWord(array, word) {
    let exists = false;
    for (const item of array) {
        if (item.includes(removeSquareBrackets(word))) {
            exists = true;
        }
    }
    return exists;
}

const generateCode = () => {
    timeBefore = new Date().getTime();
    console.log('Reading database files...');
    if (fs.existsSync(folder)) {
        deleteFolder(folder);
    }
    readFile();
};

const readFile = () => {
    fs.readFile('./databases/dummyDatabase.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        parseJSON(JSON.parse(data));
    });
};

const parseJSON = (json) => {
    let i = 0;
    let maxLength = 0;
    for (let i = 0; i < json.schemas.length; i++) {
        maxLength += json.schemas[i].tables.length;
    }

    console.log('Writing interface files...');
    for (schema of json.schemas) {
        for (table of schema.tables) {
            i++;
            let className = '';
            const bodies = [];
            className = 'I' + table.name;
            const imports = [];

            for (column of table.columns) {
                bodies.push(`\t${toCamelCase(column.name)}: ${getType(column.type)}`);
                if (isCustomType(column.type) && !findWord(imports, column.type)) {
                    // Type is a custom type, and we assume that the type is provided by the data, so that the appropriate file will be generated.
                    imports.push(
                        `import { I${removeSquareBrackets(column.type)} } from \'./I${removeSquareBrackets(
                            column.type,
                        )}\';\n`,
                    );
                }
            }
            const shouldPrint = !!(i == maxLength);

            if (imports.length > 0) {
                imports.sort();
                imports.push('\n');
            }
            const folderPath = folder + `/${schema.schemaName.toLowerCase()}`;
            formatFiles(className, bodies, imports, shouldPrint, i, folderPath);
        }
    }
};

const formatFiles = (className, bodies, imports, shouldPrint, i, folderPath) => {
    let lines = '';
    for (const imp of imports) {
        lines += imp;
    }

    lines += `export interface ${className} {`;
    for (body of bodies.sort()) {
        lines += `\n${body};`;
    }
    lines += '\n}\n';
    writeFile(className, lines, shouldPrint, i, folderPath);
};

const writeFile = (className, lines, shouldPrint, i, folderPath) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    if (fs.existsSync(folder) && !fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    fs.writeFile(`${folderPath}/${className}.ts`, lines, function (err) {
        if (err) return console.log('2: ', err);

        if (shouldPrint) {
            const timeAfter = new Date().getTime();
            const timeElapsed = timeAfter - timeBefore;
            console.log(`Wrote ${i} files in ${timeElapsed}ms`);
        }
    });
};

function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

//generateCode();

module.exports = () => {
    generateCode();
};
