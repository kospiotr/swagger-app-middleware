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
                    "/unhandledOperation": {
                        "get": {
                            "responses": responses
                        }

                    },
                    "/actionExceptionHandler": {
                        "get": {
                            "responses": responses,
                            $actionHandler: function () {
                                throw 'some exception';
                            }
                        }

                    },
                    "/overridenActionExceptionHandler": {
                        "get": {
                            "responses": responses,
                            $actionHandler: function () {
                                throw 'some exception';
                            },
                            $actionExceptionHandler: function (e, req, res) {
                                res.status(404);
                                res.send({msg: 'Customized Action Exception occured', e: e});
                            }
                        }

                    }
                }
            }
        }
    ).hostApp(app);


    app.get('/api/*', function (req, res) {
        res.send({msg: 'unhandled'});
    });

    suite({
        'setup': tester.init(app),
        'teardown': tester.destroy(),
        'should debug be disabled by default': function () {
            return tester.get('/debug', function (res) {
                expect(res).to.have.status(404);
            });
        }, 
        'should throw unhandled operation if operation has no handler': function () {
            return tester.get('/api/unhandledOperation', function (res) {
                expect(res).to.have.status(404);
                expect(res.body).is.eql({msg: 'Unhandled operation'})
            });
        },
        'should throw action exception for thrown exception in action handler': function () {
            return tester.get('/api/actionExceptionHandler', function (res) {
                expect(res).to.have.status(404);
                expect(res.body).is.eql({msg: 'Action Exception occured', e: 'some exception'})
            });
        },
        'should throw overriden action exception for thrown exception in action handler': function () {
            return tester.get('/api/overridenActionExceptionHandler', function (res) {
                expect(res).to.have.status(404);
                expect(res.body).is.eql({msg: 'Customized Action Exception occured', e: 'some exception'})
            });
        },
        'should unhandled be unhandled by next router': function () {
            return tester.get('/api/unknown', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'unhandled'})
            });
        }
    });
});
