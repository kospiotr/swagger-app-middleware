var _ = require('lodash'),
    logger = require('winston'),
    ZSchema = require("z-schema");

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

/**
 * Creates JSON Schema for simple strategy (non JSON Schema or non query speciffic strategies)
 * This method will allow to use JSON Schema validation engine for validating simple values
 * @param parameterSpec
 * @return validator
 */
var createJsonSchemaForSimpleValidationStrategy = function (parameterSpec) {
    var allowdedSimpleValidationProperties = [
        //'required',
        'description',
        'type',
        'format',
        'default',
        'maximum',
        'exclusiveMaximum',
        'minimum',
        'exclusiveMinimum',
        'maxLength',
        'minLength',
        'pattern',
        'maxItems',
        'minItems',
        'uniqueItems',
        'enum',
        'multipleOf'
    ];
    var filtered = _.pick(parameterSpec, function (value, key, object) {
        return _.includes(allowdedSimpleValidationProperties, key);
    });
    var out = _.merge({}, filtered);
    if (_.isRegExp(out.pattern)) {
        out.pattern = out.pattern.source;
    }
    return out;
};

/**
 * Validates parameter according to the following 3 strategies:
 * - query specific
 * - simple
 * - array
 * - schema
 *
 * Following properties are being used by above strategies:
 * <pre>
 * - required                    simple and schema
 * - description                 simple and schema
 * - type                        simple and schema
 * - format                      simple and schema
 * - allowEmptyValue             query specific
 * - items                       array
 * - collectionFormat            array
 * - default                     simple and schema
 * - maximum                     simple and schema
 * - exclusiveMaximum            simple and schema
 * - minimum                     simple and schema
 * - exclusiveMinimum            simple and schema
 * - maxLength                   simple and schema
 * - minLength                   simple and schema
 * - pattern                     simple and schema
 * - maxItems                    simple and schema
 * - minItems                    simple and schema
 * - uniqueItems                 simple and schema
 * - enum                        simple and schema
 * - multipleOf                  simple and schema
 * - title                       schema
 * - maxProperties               schema
 * - minProperties               schema
 * </pre>
 * @param parameter
 * @param spec
 * @returns {Function}
 */
var createValidatorForParameters = function (parameter, spec) {

    var simpleValidatorSchema = createJsonSchemaForSimpleValidationStrategy(parameter);
    logger.debug('Simple validator schema', JSON.stringify(simpleValidatorSchema, null, 2));
    var validator = new ZSchema();
    var schemaValid = validator.validateSchema(simpleValidatorSchema);
    if (!schemaValid) {
        var errors = validator.getLastErrors();
        console.log(errors);
        throw {
            msg: 'Schema not valid for input parameter',
            errors: errors
        }
    }

    return function (value) {
        var path = parameter.path;
        var name = parameter.name;
        var required = parameter.required === undefined ? false : parameter.required;

        var out = [];
        logger.debug('Validating %s: %j, required: %s', name, value, required);
        if (value === undefined) {
            if (required) {
                out.push({
                    msg: 'Field is required',
                    path: path,
                    value: value
                });
            }
            return out;
        }
        logger.debug("Validating by schema");
        var valid = validator.validate(value, simpleValidatorSchema);
        var schemaErrors = validator.getLastErrors();
        logger.debug('Exceptions', schemaErrors);
        if (schemaErrors != null) {
            _.forEach(schemaErrors, function (error, index) {

                out.push({
                    msg: error.message,
                    path: path,
                    value: value,
                    details: error
                });
            });
        }
        return out;
    };
};


module.exports = {
    createValidatorForParameters: createValidatorForParameters,
    getParameterObjectsValidationErrors: getParameterObjectsValidationErrors,
    createJsonSchemaForSimpleValidationStrategy: createJsonSchemaForSimpleValidationStrategy
};