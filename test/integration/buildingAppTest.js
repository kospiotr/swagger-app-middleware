define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var swagger = require('intern/dojo/node!../../index');

    suite({
        'should not build app if unsupported method of operation is given': function () {
            try {
                new swagger.App(
                    {
                        spec: {
                            paths: {
                                "/unsuportedMethodHandler": {
                                    "head": {
                                        '$action': function (meta) {
                                            return {msg: "headActionOperation"}
                                        }
                                    }
                                }

                            }
                        }
                    }
                ).hostApp({});
                expect.fail('app should not be build');
            } catch (e) {
                expect(e).is.eql('Unhandled method type: head');
            }
        }

    });
});
