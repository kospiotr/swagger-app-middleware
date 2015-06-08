var _ = require('lodash'),
    logger = require('winston'),
    ZSchema = require("z-schema"),
    ValidationError = require("../errors/validationException");

var registerAdditionalFormats = function () {
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

module.exports = {
    validateSchema: validateSchema
};