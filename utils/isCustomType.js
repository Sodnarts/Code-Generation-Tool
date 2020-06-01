const types = require('./types');

module.exports = (type) => {
    if (
        !types.number.includes(type.toLowerCase()) &&
        !types.string.includes(type.toLowerCase()) &&
        !types.boolean.includes(type.toLowerCase()) &&
        !types.any.includes(type.toLowerCase())
    ) {
        return true;
    } else {
        return false;
    }
};
