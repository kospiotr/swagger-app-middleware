var _ = require('lodash'),
    logger = require('winston'),
    ZSchema = require("z-schema"),
    ValidationError = require("../errors/validationException");

_.each(['byte', 'double', 'float', 'int32', 'int64', 'mime-type', 'uri-template'], function (format) {
    ZSchema.registerFormat(format, function () {
        return true;
    });
});

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

/**
 * - schema is required if "in" is "body" of the parameter
 * - items is required if "type" is "array" of the parameter
 <pre>
 {
   "name": "petId",
   "in": "path",
   "description": "ID of pet that needs to be updated",
   "required": true,
   "type": "string"
 }
 </pre>
 * @param parameter
 */
var assureValidParameterDynamicSchema = function (parameter) {
    var errors = [];

    if (parameter.in === "body" && parameter.schema == null) {
        errors.push({path: parameter.name, msg: 'schema is required if "in" is "body" of the parameter'});
    }

    if (parameter.type === "array" && parameter.items == null) {
        errors.push({path: parameter.name, msg: 'items is required if "type" is "array" of the parameter'});
    }

    return errors;
};

/**
 * Assures dynamic parts are also validated for operation
 *
 * Example input:
 <pre>
 {
 "tags": [
   "pet"
 ],
 "summary": "Updates a pet in the store with form data",
 "description": "",
 "operationId": "updatePetWithForm",
 "consumes": [
   "application/x-www-form-urlencoded"
 ],
 "produces": [
   "application/json",
   "application/xml"
 ],
 "parameters": [
   {
     "name": "petId",
     "in": "path",
     "description": "ID of pet that needs to be updated",
     "required": true,
     "type": "string"
   },
   {
     "name": "name",
     "in": "formData",
     "description": "Updated name of the pet",
     "required": false,
     "type": "string"
   },
   {
     "name": "status",
     "in": "formData",
     "description": "Updated status of the pet",
     "required": false,
     "type": "string"
   }
 ],
 "responses": {
   "200": {
     "description": "Pet updated."
   },
   "405": {
     "description": "Invalid input"
   }
 },
 "security": [
   {
     "petstore_auth": [
       "write:pets",
       "read:pets"
     ]
   }
 ]
}
 * </pre>
 * @param operation
 */
var assureValidOperationDynamicSchema = function (operation) {
    var errors = [];
    _.forEach(operation.parameters, function (parameter) {
        errors = errors.concat(assureValidParameterDynamicSchema(parameter));
    })

    if (errors.length > 0) {
        logger.debug('Operation has dynamic schema issues %o', errors);
        throw {msg: 'Operation has dynamic schema issues.', errors: errors};
    }
};

module.exports = {
    validateSchema: validateSchema,
    precompileSchemaValidatorsForParameter: precompileSchemaValidatorsForParameter,
    assureValidOperationDynamicSchema: assureValidOperationDynamicSchema
};