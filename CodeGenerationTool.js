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

startMode(2);
