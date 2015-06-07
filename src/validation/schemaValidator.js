var _ = require('lodash'),
    logger = require('winston'),
    ZSchema = require("z-schema"),
    ValidationError = require("../errors/validationException");

var registerAdditionalFormats = function() {
    _.each(['byte', 'double', 'float', 'int32', 'int64', 'mime-type', 'uri-template', 'password'], function (format) {
        ZSchema.registerFormat(format, function () {
            return true;
        });
    });
};
registerAdditionalFormats();

var validateSchema = function (data, schemas) {
    var validator = new ZSchema();
    var valid = validator.validate(data, schemas);

    var errors = validator.getLastErrors();
    if (!valid) {
        throw new ValidationError(errors);

    }
};

var precompileSchemaValidatorsForParameter = function (spec, inputParameterSchema) {
    var validator = new ZSchema();
    var schemaValid = validator.validateSchema(spec);
    if (!schemaValid) {
        var errors = validator.getLastErrors();
        logger.debug(errors);
        throw {
            msg: 'Schema not valid for input parameter',
            errors: errors
        }
    }

    return function (value) {
        var valid = validator.validate(value, inputParameterSchema);

        if (!valid) {
            var errors = validator.getLastErrors();
            throw {
                msg: 'Input parameter is invalid agains schema',
                value: value,
                schema: inputParameterSchema,
                errors: errors
            }
        }
    }
};

module.exports = {
    validateSchema: validateSchema,
    precompileSchemaValidatorsForParameter: precompileSchemaValidatorsForParameter
};