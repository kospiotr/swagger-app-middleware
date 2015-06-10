define(function (require) {
    var suite = require('intern!object');
    var parameterValidator = require('intern/dojo/node!../../src/builders/parameterValidator');
    var expect = require('intern/chai!expect');
    var logger = require('intern/dojo/node!winston');
    var ZSchema = require("intern/dojo/node!z-schema");
    var fs = require("intern/dojo/node!fs");
    var _ = require("intern/dojo/node!lodash");

    logger.level = 'debug';

    var schemaWithDefinitions = {
        "definitions": {
            "Pet": {
                "discriminator": "petType",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "petType": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "petType"
                ]
            }
        },
        "Cat": {
            "description": "A representation of a cat",
            "allOf": [
                {
                    "$ref": "#/definitions/Pet"
                },
                {
                    "properties": {
                        "huntingSkill": {
                            "type": "string",
                            "description": "The measured skill for hunting",
                            "default": "lazy",
                            "enum": [
                                "clueless",
                                "lazy",
                                "adventurous",
                                "aggressive"
                            ]
                        }
                    },
                    "required": [
                        "huntingSkill"
                    ]
                }
            ]
        },
        "Dog": {
            "description": "A representation of a dog",
            "allOf": [
                {
                    "$ref": "#/definitions/Pet"
                },
                {
                    "properties": {
                        "packSize": {
                            "type": "integer",
                            "format": "int32",
                            "description": "the size of the pack the dog is from",
                            "default": 0,
                            "minimum": 0
                        }
                    },
                    "required": [
                        "packSize"
                    ]
                }
            ]
        }
    };
    var validate = function (value, parameter) {
        var validator = parameterValidator.createValidatorForParameters(parameter, schemaWithDefinitions);
        return validator(value);
    };

    suite({
        'should validate parameter schema': function () {
            try {
                validate(undefined, {
                    name: 'id',
                    path: '/action',
                    type: 'unknown'
                });
                expect.fail('should fail');
            } catch (e) {
                expect(e.msg).is.eql('Schema not valid for input parameter');
            }
        },

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

        //--------------- simple type

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
                items: {},
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
        },

        //--------------- array
        'should filter ItemObject parameters': function () {
            var filtered = parameterValidator.filterItemsObjectParameters({
                "type": "array",
                "items": {
                    "items": {
                        "items": {
                            "collectionFormat": "collectionFormat",
                            'type': 'type',
                            'format': 'format',
                            'items': 'items',
                            'default': 'default',
                            'maximum': 'maximum',
                            'exclusiveMaximum': 'exclusiveMaximum',
                            'minimum': 'minimum',
                            'exclusiveMinimum': 'exclusiveMinimum',
                            'maxLength': 'maxLength',
                            'minLength': 'minLength',
                            'pattern': 'pattern',
                            'maxItems': 'maxItems',
                            'minItems': 'minItems',
                            'uniqueItems': 'uniqueItems',
                            'enum': 'enum',
                            'multipleOf': 'multipleOf'
                        },
                        "collectionFormat": "collectionFormat",
                        'type': 'type',
                        'format': 'format',
                        'default': 'default',
                        'maximum': 'maximum',
                        'exclusiveMaximum': 'exclusiveMaximum',
                        'minimum': 'minimum',
                        'exclusiveMinimum': 'exclusiveMinimum',
                        'maxLength': 'maxLength',
                        'minLength': 'minLength',
                        'pattern': 'pattern',
                        'maxItems': 'maxItems',
                        'minItems': 'minItems',
                        'uniqueItems': 'uniqueItems',
                        'enum': 'enum',
                        'multipleOf': 'multipleOf'
                    },
                    "collectionFormat": "collectionFormat",
                    'type': 'type',
                    'format': 'format',
                    'default': 'default',
                    'maximum': 'maximum',
                    'exclusiveMaximum': 'exclusiveMaximum',
                    'minimum': 'minimum',
                    'exclusiveMinimum': 'exclusiveMinimum',
                    'maxLength': 'maxLength',
                    'minLength': 'minLength',
                    'pattern': 'pattern',
                    'maxItems': 'maxItems',
                    'minItems': 'minItems',
                    'uniqueItems': 'uniqueItems',
                    'enum': 'enum',
                    'multipleOf': 'multipleOf'
                }
            });

            expect(filtered).is.not.empty;
            expect(filtered.items.type).is.eql('type');
            expect(filtered.items.format).is.eql('format');
            expect(filtered.items.default).is.eql('default');
            expect(filtered.items.maximum).is.eql('maximum');
            expect(filtered.items.exclusiveMaximum).is.eql('exclusiveMaximum');
            expect(filtered.items.minimum).is.eql('minimum');
            expect(filtered.items.exclusiveMinimum).is.eql('exclusiveMinimum');
            expect(filtered.items.maxLength).is.eql('maxLength');
            expect(filtered.items.minLength).is.eql('minLength');
            expect(filtered.items.pattern).is.eql('pattern');
            expect(filtered.items.maxItems).is.eql('maxItems');
            expect(filtered.items.minItems).is.eql('minItems');
            expect(filtered.items.uniqueItems).is.eql('uniqueItems');
            expect(filtered.items.enum).is.eql('enum');
            expect(filtered.items.multipleOf).is.eql('multipleOf');

            expect(filtered.items.items.type).is.eql('type');
            expect(filtered.items.items.format).is.eql('format');
            expect(filtered.items.items.default).is.eql('default');
            expect(filtered.items.items.maximum).is.eql('maximum');
            expect(filtered.items.items.exclusiveMaximum).is.eql('exclusiveMaximum');
            expect(filtered.items.items.minimum).is.eql('minimum');
            expect(filtered.items.items.exclusiveMinimum).is.eql('exclusiveMinimum');
            expect(filtered.items.items.maxLength).is.eql('maxLength');
            expect(filtered.items.items.minLength).is.eql('minLength');
            expect(filtered.items.items.pattern).is.eql('pattern');
            expect(filtered.items.items.maxItems).is.eql('maxItems');
            expect(filtered.items.items.minItems).is.eql('minItems');
            expect(filtered.items.items.uniqueItems).is.eql('uniqueItems');
            expect(filtered.items.items.enum).is.eql('enum');
            expect(filtered.items.items.multipleOf).is.eql('multipleOf');

            expect(filtered.items.items.items.type).is.eql('type');
            expect(filtered.items.items.items.format).is.eql('format');
            expect(filtered.items.items.items.default).is.eql('default');
            expect(filtered.items.items.items.maximum).is.eql('maximum');
            expect(filtered.items.items.items.exclusiveMaximum).is.eql('exclusiveMaximum');
            expect(filtered.items.items.items.minimum).is.eql('minimum');
            expect(filtered.items.items.items.exclusiveMinimum).is.eql('exclusiveMinimum');
            expect(filtered.items.items.items.maxLength).is.eql('maxLength');
            expect(filtered.items.items.items.minLength).is.eql('minLength');
            expect(filtered.items.items.items.pattern).is.eql('pattern');
            expect(filtered.items.items.items.maxItems).is.eql('maxItems');
            expect(filtered.items.items.items.minItems).is.eql('minItems');
            expect(filtered.items.items.items.uniqueItems).is.eql('uniqueItems');
            expect(filtered.items.items.items.enum).is.eql('enum');
            expect(filtered.items.items.items.multipleOf).is.eql('multipleOf');

            expect(filtered.items.collectionFormat).is.undefined;
            expect(filtered.items.items.collectionFormat).is.undefined;
            expect(filtered.items.items.items.collectionFormat).is.undefined;
        },

        'should validation pass when validating valid array': function () {
            var errors = validate([10, 20], {
                name: 'id',
                path: '/action',
                type: "array",
                items: {
                    type: "integer",
                    minimum: 0,
                    maximum: 63
                }
            });


            expect(errors).is.empty;
        },

        'should validation fail when validating invalid array': function () {
            var errors = validate([-10, 200], {
                name: 'id',
                path: '/action',
                type: "array",
                items: {
                    type: "integer",
                    minimum: 0,
                    maximum: 63
                }
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Value 200 is greater than maximum 63");
            expect(errors[1].msg).is.eql("Value -10 is less than minimum 0");
        },

        //--------------- body in type

        'should validation pass when body in method and inline schema valid': function () {
            var errors = validate(['abc', 'cde'], {
                name: 'id',
                path: '/action',
                in: 'body',
                "schema": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            });


            expect(errors).is.empty;
        },

        'should validation fail when body in method and inline schema not valid': function () {
            var errors = validate([1234, 5678], {
                name: 'id',
                path: '/action',
                in: 'body',
                "schema": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            });


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Expected type string but found type integer");
        },

        'should validation pass when body in method and reference schema valid': function () {

            var errors = validate({
                name: 'MyName',
                petType: 'Dog'
            }, {
                name: 'id',
                path: '/action',
                in: "body",
                schema: {'$ref': '#/definitions/Pet'}
            }, schemaWithDefinitions);


            expect(errors).is.empty;
        },

        'should validation fail when body in method and reference schema not valid': function () {

            var errors = validate({}, {
                name: 'id',
                path: '/action',
                in: "body",
                schema: {'$ref': '#/definitions/Pet'}
            }, schemaWithDefinitions);


            expect(errors).is.not.empty;
            expect(errors[0].msg).is.eql("Missing required property: petType");
            expect(errors[1].msg).is.eql("Missing required property: name");
        }

    });
});
