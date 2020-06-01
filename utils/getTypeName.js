const types = require('./types');

module.exports = (type) => {
    if (types.number.includes(type.toLowerCase())) {
        return 'number';
    } else if (types.string.includes(type.toLowerCase())) {
        return 'string';
    } else if (types.boolean.includes(type.toLowerCase())) {
        return 'boolean';
    } else {
        return 'I' + type;
    }
};
