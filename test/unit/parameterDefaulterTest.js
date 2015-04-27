define(function (require) {
    var suite = require('intern!object');
    var parameterDefaulter = require('intern/dojo/node!../../src/builders/parameterDefaulter');
    var expect = require('intern/chai!expect');
    var logger = require('intern/dojo/node!winston');

    logger.level = 'debug';

    suite({
        'should return undefind when undefined and no default value': function () {
            var defaultedValue = parameterDefaulter.getDefaultedParameter(undefined, {
                name: 'id'
            });
            expect(defaultedValue).is.equals(undefined);
        },
        'should not fill default values when no default parameter is set up': function () {
            var defaultedValue = parameterDefaulter.getDefaultedParameter('test', {
                name: 'id'
            });
            expect(defaultedValue).is.equals('test');
        },
        'should not fill default values when default parameter is set up but value is defined': function () {
            var defaultedValue = parameterDefaulter.getDefaultedParameter('test', {
                name: 'id',
                default: 'abc'
            });
            expect(defaultedValue).is.equals('test');
        },
        'should fill default values value is undefined and default value is present': function () {
            var defaultedValue = parameterDefaulter.getDefaultedParameter(undefined, {
                name: 'id',
                default: 'test'
            });
            expect(defaultedValue).is.equals('test');
        }

    });
});