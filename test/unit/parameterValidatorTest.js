define(function (require) {
    var suite = require('intern!object');
    var parameterValidator = require('intern/dojo/node!../../src/builders/parameterValidator');
    var expect = require('intern/chai!expect');
    var logger = require('intern/dojo/node!winston');

    logger.level = 'debug';

    var validate = function (value, parameter, spec) {
        var validator = parameterValidator.createValidatorForParameters(parameter, spec);
        return validator(value);
    };

    suite({
        'should pass validation when not required and value undefined': function () {
            var errors = validate(undefined, {
                name: 'id',
                path: '/action'
            });
            expect(errors).is.empty;
        },

        'should validation fail when required and value undefined': function () {
            var errors = validate(undefined, {
                name: 'id',
                path: '/action',
                required: true
            });
            expect(errors).to.be.not.null;
            expect(errors).is.not.empty;
            expect(errors[0].path).to.eql('/action');
            expect(errors[0].value).to.eql(undefined);
            expect(errors[0].msg).to.eql('Field is required');
        },

        'should create JSON Schema for simple parameter': function () {
            var jsonSchema = parameterValidator.createJsonSchemaForSimpleValidationStrategy({
                required: true,
                description: true,
                type: true,
                format: true,
                allowEmptyValue: true,
                items: true,
                collectionFormat: true,
                default: true,
                maximum: true,
                exclusiveMaximum: true,
                minimum: true,
                exclusiveMinimum: true,
                maxLength: true,
                minLength: true,
                pattern: true,
                maxItems: true,
                minItems: true,
                uniqueItems: true,
                enum: true,
                multipleOf: true,
                title: true,
                maxProperties: true,
                minProperties: true
            });

            expect(jsonSchema).to.eql({
                description: true,
                type: true,
                format: true,
                default: true,
                maximum: true,
                exclusiveMaximum: true,
                minimum: true,
                exclusiveMinimum: true,
                maxLength: true,
                minLength: true,
                pattern: true,
                maxItems: true,
                minItems: true,
                uniqueItems: true,
                enum: true,
                multipleOf: true
            });
        },

        'should validation pass when schema type matches': function () {
            var errors = validate("123", {
                name: 'id',
                path: '/action',
                type: "string"
            });
            expect(errors).is.empty;
        },

        'should validation fail when schema type not match': function () {
            var errors = validate(123, {
                name: 'id',
                path: '/action',
                type: "string"
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql('Expected type string but found type integer');
        }

    });
});