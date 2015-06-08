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
        },

        'should validation fail when schema date-time format not match': function () {
            var errors = validate('2002-10-02T1a:00:00-05:00', {
                name: 'id',
                path: '/action',
                type: "string",
                format: "date-time"
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Object didn't pass validation for format date-time: 2002-10-02T1a:00:00-05:00");
        },

        'should validation pass when schema date-time format match': function () {
            var errors = validate('2002-10-02T10:00:00-05:00', {
                name: 'id',
                path: '/action',
                type: "string",
                format: "date-time"
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema date format not match': function () {
            var errors = validate('2002-10-0a', {
                name: 'id',
                path: '/action',
                type: "string",
                format: "date"
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Object didn't pass validation for format date: 2002-10-0a");
        },

        'should validation fail when schema date format not match': function () {
            var errors = validate('2002-10-02', {
                name: 'id',
                path: '/action',
                type: "string",
                format: "date"
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema maximum exceeded': function () {
            var errors = validate(20, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 20 is greater than maximum 10");
        },

        'should validation pass when value less than schema maximum': function () {
            var errors = validate(5, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10
            });

            expect(errors).is.empty;
        },

        'should validation pass when value equal schema maximum': function () {
            var errors = validate(10, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema exclusiveMaximum exceeded': function () {
            var errors = validate(10, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10,
                exclusiveMaximum: true
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 10 is equal or greater than exclusive maximum 10");
        },

        'should validation pass when schema maximum not exceeded': function () {
            var errors = validate(5, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10,
                exclusiveMaximum: true
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema maximum exceeded': function () {
            var errors = validate(20, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 20 is greater than maximum 10");
        },

        'should validation pass when value less than schema maximum': function () {
            var errors = validate(5, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10
            });

            expect(errors).is.empty;
        },

        'should validation pass when value equal schema maximum': function () {
            var errors = validate(10, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema exclusiveMaximum exceeded': function () {
            var errors = validate(10, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10,
                exclusiveMaximum: true
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 10 is equal or greater than exclusive maximum 10");
        },

        'should validation pass when schema maximum not exceeded': function () {
            var errors = validate(5, {
                name: 'id',
                path: '/action',
                type: "integer",
                maximum: 10,
                exclusiveMaximum: true
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema minimum not reached': function () {
            var errors = validate(5, {
                name: 'id',
                path: '/action',
                type: "integer",
                minimum: 10
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 5 is less than minimum 10");
        },

        'should validation pass when value more than schema minimum': function () {
            var errors = validate(15, {
                name: 'id',
                path: '/action',
                type: "integer",
                minimum: 10
            });

            expect(errors).is.empty;
        },

        'should validation pass when value equal schema minimum': function () {
            var errors = validate(10, {
                name: 'id',
                path: '/action',
                type: "integer",
                minimum: 10
            });

            expect(errors).is.empty;
        },

        'should validation fail when schema exclusiveMinimum exceeded': function () {
            var errors = validate(10, {
                name: 'id',
                path: '/action',
                type: "integer",
                minimum: 10,
                exclusiveMinimum: true
            });

            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 10 is equal or less than exclusive minimum 10");
        },

        'should validation pass when schema minimum exceeded': function () {
            var errors = validate(15, {
                name: 'id',
                path: '/action',
                type: "integer",
                minimum: 10,
                exclusiveMinimum: true
            });

            expect(errors).is.empty;
        },

        'should validation pass when less than maxLength': function () {
            var errors = validate("abcdef", {
                name: 'id',
                path: '/action',
                type: "string",
                maxLength: 10
            });

            expect(errors).is.empty;
        },

        'should validation fail when more than maxLength': function () {
            var errors = validate("abcdef", {
                name: 'id',
                path: '/action',
                type: "string",
                maxLength: 5
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("String is too long (6 chars), maximum 5");
        },

        'should validation pass when more than minLength': function () {
            var errors = validate("abcdefghijk", {
                name: 'id',
                path: '/action',
                type: "string",
                minLength: 5
            });

            expect(errors).is.empty;
        },

        'should validation fail when less than minLength': function () {
            var errors = validate("abcdef", {
                name: 'id',
                path: '/action',
                type: "string",
                minLength: 10
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("String is too short (6 chars), minimum 10");
        },

        'should validation pass when value matches pattern': function () {
            var errors = validate('123', {
                name: 'id',
                path: '/action',
                type: "string",
                pattern: "\\d\\d\\d"
            });

            expect(errors).is.empty;
        },

        'should validation fail when value not match pattern': function () {
            var errors = validate('abc', {
                name: 'id',
                path: '/action',
                type: "string",
                pattern: '\\d\\d\\d'
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("String does not match pattern \\d\\d\\d: abc");
        },

        'should validation pass when value matches native pattern': function () {
            var errors = validate('123', {
                name: 'id',
                path: '/action',
                type: "string",
                pattern: /\d\d\d/
            });

            expect(errors).is.empty;
        },

        'should validation fail when value not match native pattern': function () {
            var errors = validate('abc', {
                name: 'id',
                path: '/action',
                type: "string",
                pattern: /\d\d\d/
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("String does not match pattern \\d\\d\\d: abc");
        },

        'should validation pass when less than maxItems': function () {
            var errors = validate([1, 2, 3, 4], {
                name: 'id',
                path: '/action',
                type: "array",
                maxItems: 5
            });

            expect(errors).is.empty;
        },

        'should validation pass when less than maxItems': function () {
            var errors = validate([1, 2, 3, 4, 5, 6], {
                name: 'id',
                path: '/action',
                type: "array",
                maxItems: 5
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Array is too long (6), maximum 5");
        },

        'should validation pass when greater than minItems': function () {
            var errors = validate([1, 2, 3, 4, 5, 6], {
                name: 'id',
                path: '/action',
                type: "array",
                minItems: 5
            });

            expect(errors).is.empty;
        },

        'should validation pass when less than minItems': function () {
            var errors = validate([1, 2, 3, 4], {
                name: 'id',
                path: '/action',
                type: "array",
                minItems: 5
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Array is too short (4), minimum 5");
        },

        'should validation pass when unique items': function () {
            var errors = validate([1, 2, 3, 4, 5, 6], {
                name: 'id',
                path: '/action',
                type: "array",
                uniqueItems: true
            });

            expect(errors).is.empty;
        },

        'should validation pass when less than minItems': function () {
            var errors = validate([1, 2, 2, 4], {
                name: 'id',
                path: '/action',
                type: "array",
                uniqueItems: true
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Array items are not unique (indexes 1 and 2)");
        },

        'should validation pass when enum': function () {
            var errors = validate('a', {
                name: 'id',
                path: '/action',
                enum: ['a', 'b', 'c']
            });

            expect(errors).is.empty;
        },

        'should validation pass when not enum': function () {
            var errors = validate('d', {
                name: 'id',
                path: '/action',
                enum: ['a', 'b', 'c']
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("No enum match for: d");
        },

        'should validation pass when multiple': function () {
            var errors = validate(30, {
                name: 'id',
                path: '/action',
                multipleOf: 10
            });

            expect(errors).is.empty;
        },

        'should validation pass when not multiple': function () {
            var errors = validate(15, {
                name: 'id',
                path: '/action',
                multipleOf: 10
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 15 is not a multiple of 10");
        }
    });
});
