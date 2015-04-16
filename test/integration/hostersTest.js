define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();

    app.get('/test', function (req, res) {
        res.json({status: 'ok'});
    });
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

                    },
                    "/requestHandler": {
                        "get": {
                            "responses": responses,
                            '$requestHandler': function (req, res) {
                                res.json({msg: "requestHandler"});
                            }
                        }

                    },
                    "/requestBeforeActionHandler": {
                        "get": {
                            "responses": responses,
                            '$actionHandler': function (meta) {
                                return {msg: "actionHandler"}
                            },
                            '$requestHandler': function (req, res) {
                                res.json({msg: "requestHandler"});
                            }

                        }

                    }
                }
            },
            debug: true
        }
    ).hostApp(app);

    suite({
        'setup': tester.init(app),
        'teardown': tester.destroy(),
        'should test page be present': function () {
            return tester.get('/test', function (res) {
                expect(res).to.have.status(200);
            });
        },
        'should debug page be present': function () {
            return tester.get('/debug', function (res) {
                expect(res).to.have.status(200);
            });
        },
        'should handle action': function () {
            return tester.get('/api/actionHandler', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: "actionHandler"})
            });
        },
        'should handle request': function () {
            return tester.get('/api/requestHandler', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: "requestHandler"})
            });
        },
        'should handle request before action': function () {
            return tester.get('/api/requestBeforeActionHandler', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: "requestHandler"})
            });
        }
    });
});
