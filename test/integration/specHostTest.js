define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();

    var responses = {
        "default": {
            "description": "result"
        }
    };
    new swagger.App(
        {
            spec: {
                paths: {
                    "/actionHandler": {
                        "get": {
                            "responses": responses,
                            '$actionHandler': function (meta) {
                                return {msg: "actionHandler"}
                            }
                        }

                    }
                }
            }
        }
    ).hostApp(app);

    suite({
        'setup': tester.init(app),
        'teardown': tester.destroy(),
        'should host spec': function () {
            return tester.get('/spec.json', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({
                    "swagger": "2.0",
                    "info": {
                        "title": "Sample swagger based app",
                        "version": "1.0.0"
                    },
                    "basePath": "/api",
                    "paths": {
                        "/actionHandler": {
                            "get": {
                                "responses": {
                                    "default": {
                                        "description": "result"
                                    }
                                }
                            }
                        }
                    },
                    "schemes": [
                        "http"
                    ]
                });
            });
        }
    });
});
