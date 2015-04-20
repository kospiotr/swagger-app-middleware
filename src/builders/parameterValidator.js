var _ = require('lodash');
var logger = require('winston');

var getParameterObjectsValidationErrors = function (actionInputParameters, operation) {
    var out = [];
    _.forEach(operation.parameters, function (parameter, index) {
        var actionInputParameter = actionInputParameters[index];
        var validationResult = parameter.$validator(actionInputParameter);
        if (_.isArray(validationResult)) {
            validationResult = validationResult;
        } else if (_.isObject(validationResult)) {
            validationResult = [validationResult];
        } else {
            return;
        }
        out = out.concat(validationResult);
    });
    return out;
};

var addException = function (msg, code, path, name, value, out) {
    out.push({
        msg: 'Field is required',
        code: 'required',
        path: path,
        name: name,
        value: value
    });
};

var createValidatorForParameters = function (parameter, spec) {
    return function (value) {
        var path = parameter.path;
        var name = parameter.name;
        var out = [];
        logger.debug('Validating ' + name + ': ' + value);
        if (parameter.required && value === undefined) {
            addException('Field is required', 'required', path, name, value, out);
        }
        logger.debug('Exceptions', out);
        return out;
    };
};


module.exports = {
    createValidatorForParameters: createValidatorForParameters,
    getParameterObjectsValidationErrors: getParameterObjectsValidationErrors
};