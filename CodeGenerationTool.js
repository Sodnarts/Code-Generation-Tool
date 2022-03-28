const NoSQLTransformer = require('./tranformers/NoSQLTransformation');
const SQLTransformer = require('./tranformers/SQLTransformation');
const GenerateDatabaseStructure = require('./dummy-data/GenerateDatabaseStructure');

const generateCodeFromNoSQL = () => {
    NoSQLTransformer();
};

const generateCodeFromSQL = () => {
    SQLTransformer();
};

const generateDatabaseStructure = () => {
    GenerateDatabaseStructure();
};

const startMode = (position) => {
    switch (position) {
        case 1:
            generateCodeFromNoSQL();
            break;
        case 2:
            generateCodeFromSQL();
            break;
        case 3:
            generateDatabaseStructure();
            break;
    }
};

//startMode(2);

// Mode 1 - 126 lines per iteration
// Mode 2 - 103 lines per iteration
// Mode 3 - 283 lines per iteration

let arr = [];

const test2 = () => {
    let prevVal = 83;

    for (let i = 0; i < 99; i++) {
        let nexVal = prevVal * 1.11;
        console.log('Lvl ', i + 1, ': ', prevVal);
        arr.push(nexVal);
        prevVal = nexVal;
    }
};
test2();
