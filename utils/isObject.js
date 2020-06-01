module.exports = (type, object, interfaces, classNames) => {
    if (type === 'Iobject') {
        if (object instanceof Array) {
            if (object.length === 0) {
                return 'any[]';
            }

            let isString = true;
            let isNumber = true;
            let isBoolean = true;

            for (const obj of object) {
                if (typeof obj !== 'string') {
                    isString = false;
                }

                if (typeof obj !== 'number') {
                    isNumber = false;
                }

                if (typeof obj !== 'boolean') {
                    isBoolean = false;
                }
            }

            if (isString) {
                return 'string[]';
            } else if (isNumber) {
                return 'number[]';
            } else if (isBoolean) {
                return 'boolean[]';
            } else {
                return findCorrespondingInterface(object, interfaces, classNames);
            }
        } else if (object instanceof Object) {
            return 'object';
        }
        return 'any';
    }

    return type;
};

const findCorrespondingInterface = (object, interfaces, classNames) => {
    const objKeys = [];
    for (const key in object[0]) {
        if (object[0].hasOwnProperty(key)) {
            objKeys.push(key);
        }
    }

    objKeys.sort();
    let j = 0;

    for (const interface of interfaces) {
        let isEqual = false;
        let className = '';

        const interfaceProperties = interface.substring(0, interface.length - 2).split(',');
        interfaceProperties.sort();

        const length = !!(objKeys.length === interfaceProperties.length) ? objKeys.length : -1;
        for (let i = 0; i < length; i++) {
            isEqual = !!(objKeys[i] === interfaceProperties[i]) ? true : false;
            !!isEqual ? (className = classNames[j]) : '';
        }

        if (isEqual) {
            return `${className.substring(1, className.length)}[]`;
        }
    }

    j++;
    return 'any[]';
};
