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
            expect(errors[0].path).is.equal('/action');
            expect(errors[0].value).is.equal(undefined);
            expect(errors[0].msg).is.equal('Field is required');
        }


    });
});