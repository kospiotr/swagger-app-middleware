define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var logger = require('intern/dojo/node!winston');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();


    logger.level = 'debug';

    new swagger.App(
        {
            spec: {
                paths: {
                    "/simpleConvert": {
                        "get": {
                            parameters: [
                                {
                                    name: 'integer',
                                    in: 'query',
                                    type: 'integer',
                                    format: 'int32'

                                }
                            ],
                            $actionHandler: function (integer, long, float, double, string, byte, bool, date, dateTime, password) {
                                return {
                                    integer: integer,
                                    long: long,
                                    float: float,
                                    double: double,
                                    string: string,
                                    byte: byte,
                                    bool: bool,
                                    date: date,
                                    dateTime: dateTime,
                                    password: password
                                };
                            }
                        }
                    },
                    "/action": {
                        "get": {
                            "parameters": [
                                {
                                    "name": "undef",
                                    "in": "query",
                                    "type": "string"
                                },
                                {
                                    "name": "def",
                                    "in": "query",
                                    "type": "string"
                                },
                                {
                                    "name": "defDefault",
                                    "in": "query",
                                    "type": "string",
                                    "default": "def"
                                },
                                {
                                    "name": "undefDefault",
                                    "in": "query",
                                    "type": "string",
                                    "default": "def"
                                }

                            ],
                            '$actionHandler': function (undef, def, defDefault, undefDefault) {
                                return {undef: undef, def: def, defDefault: defDefault, undefDefault: undefDefault}
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
        'should be good': function () {
            return tester.get('/api/action?def=defV&defDefault=defDefaultV', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({
                    def: "defV", defDefault: "defDefaultV", undefDefault: "def"
                })
            });
        }
    });
});
