define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();

    suite({
        'should not build app if unsupported method of operation is given': function () {
            try {
                new swagger.App(
                    {
                        spec: {
                            paths: {
                                "/unsuportedMethodHandler": {
                                    "head": {
                                        '$actionHandler': function (meta) {
                                            return {msg: "headActionOperation"}
                                        }
                                    }
                                }

                            }
                        }
                    }
                ).hostApp(app);
                expect.fail('app should not be build');
            } catch (e) {
                expect(e.toString()).is.eql('Unknow method type: head');
            }
        },
        'should not build app if spec is not valid': function () {
            try {
                new swagger.App(
                    {
                        spec: {
                            patherss: {
                                "/unsuportedMethodHandler": {
                                    "get": {
                                        '$actionHandler': function (meta) {
                                            return {msg: "headActionOperation"}
                                        }
                                    }
                                }

                            }
                        }
                    }
                ).hostApp(app);
                expect.fail('app should not be build');
            } catch (e) {
                expect(e.toString()).is.eql('Error: Validation exception');
            }
        }

    });
});
