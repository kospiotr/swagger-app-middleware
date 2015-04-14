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
                    "/getActionOperation": {
                        "get": {
                            "responses": responses,
                            '$actionHandler': function (meta) {
                                return {msg: "getActionOperation"}
                            }
                        }

                    },
                    "/getRequestOperation": {
                        "get": {
                            "responses": responses,
                            '$requestHandler': function (req, res) {
                                res.json({msg: "getRequestOperation"});
                            }
                        }
                    },
                    "/postActionOperation": {
                        "post": {
                            "responses": responses,
                            '$actionHandler': function (meta) {
                                return {msg: "postActionOperation"}
                            }
                        }

                    },
                    "/postRequestOperation": {
                        "post": {
                            "responses": responses,
                            '$requestHandler': function (req, res) {
                                res.json({msg: "postRequestOperation"});
                            }
                        }
                    },
                    "/putActionOperation": {
                        "put": {
                            "responses": responses,
                            '$actionHandler': function (meta) {
                                return {msg: "putActionOperation"}
                            }
                        }

                    },
                    "/putRequestOperation": {
                        "put": {
                            "responses": responses,
                            '$requestHandler': function (req, res) {
                                res.json({msg: "putRequestOperation"});
                            }
                        }
                    },
                    "/deleteActionOperation": {
                        "delete": {
                            "responses": responses,
                            '$actionHandler': function (meta) {
                                return {msg: "deleteActionOperation"}
                            }
                        }

                    },
                    "/deleteRequestOperation": {
                        "delete": {
                            "responses": responses,
                            '$requestHandler': function (req, res) {
                                res.json({msg: "deleteRequestOperation"});
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
        'should handle get action operation': function () {
            return tester.get('/api/getActionOperation', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'getActionOperation'})
            });
        },
        'should handle get request operation': function () {
            return tester.get('/api/getRequestOperation', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'getRequestOperation'})
            });
        },
        'should handle post action operation': function () {
            return tester.post('/api/postActionOperation', {}, function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'postActionOperation'})
            });
        },
        'should handle post request operation': function () {
            return tester.post('/api/postRequestOperation', {}, function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'postRequestOperation'})
            });
        },
        'should handle put action operation': function () {
            return tester.put('/api/putActionOperation', {}, function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'putActionOperation'})
            });
        },
        'should handle put request operation': function () {
            return tester.put('/api/putRequestOperation', {}, function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'putRequestOperation'})
            });
        },
        'should handle delete action operation': function () {
            return tester.delete('/api/deleteActionOperation', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'deleteActionOperation'})
            });
        },
        'should handle delete request operation': function () {
            return tester.delete('/api/deleteRequestOperation', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({msg: 'deleteRequestOperation'})
            });
        }
    });
});
