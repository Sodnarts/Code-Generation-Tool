const fs = require('fs');
const folder = './databases';

let timeBefore;
const amountOfCycles = 1;

const lines = 279; // Has to correspond to the non-static lines in dataToMakeDatabaseData.js --> total amount of lines minus 4.

const staticLines = 4;

const generateDatabaseFiles = () => {
    timeBefore = new Date().getTime();
    readFile();
};

const readFile = () => {
    fs.readFile('./dummy-data/dataToMakeDatabaseData.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        formatFile(JSON.parse(data));
    });
};

const formatFile = (json) => {
    console.log('Writing to file...');
    let amount = 0;
    let text = '{\n\t"schemas": [';
    for (let i = 0; i < amountOfCycles; i++) {
        for (let n = 0; n < json.schemas.length; n++) {
            text += '\n\t\t{';
            text += `\n\t\t\t\"schemaName\": \"${json.schemas[n].schemaName}\",`;
            text += '\n\t\t\t"tables": [';
            for (let j = 0; j < json.schemas[n].tables.length; j++) {
                amount++;
                const table = json.schemas[n].tables[j];
                text += '\n\t\t\t\t{';
                text += `\n\t\t\t\t\t\"name\": \"${table.name}${!!(i !== 0) ? i : ''}\",`;
                text += '\n\t\t\t\t\t"columns": [';
                for (let k = 0; k < table.columns.length; k++) {
                    text += '\n\t\t\t\t\t\t{';
                    text += `\n\t\t\t\t\t\t\t\"name\": \"${table.columns[k].name}\",`;
                    text += `\n\t\t\t\t\t\t\t\"type\": \"${table.columns[k].type}\"`;
                    if (k == table.columns.length - 1) {
                        text += '\n\t\t\t\t\t\t}';
                    } else {
                        text += '\n\t\t\t\t\t\t},';
                    }
                }
                text += '\n\t\t\t\t\t]';
                if (j == json.schemas[n].tables.length - 1) {
                    text += '\n\t\t\t\t}';
                } else {
                    text += '\n\t\t\t\t},';
                }
            }
            text += '\n\t\t\t]';
            if (n == json.schemas.length - 1 && i == amountOfCycles - 1) {
                text += '\n\t\t}';
            } else {
                text += '\n\t\t},';
            }
        }
    }

    text += '\n\t]\n}';

    writeFile(text);
};

const writeFile = (text) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    fs.writeFile(`${folder}/dummyDatabase.json`, text, function (err) {
        if (err) return console.log('2: ', err);
        const timeAfter = new Date().getTime();
        const timeElapsed = timeAfter - timeBefore;
        console.log(`Wrote ${amountOfCycles * lines + staticLines} lines in ${timeElapsed}ms.`);
    });
};

module.exports = () => {
    generateDatabaseFiles();
};
