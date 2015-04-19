define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var logger = require('intern/dojo/node!winston');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();


    logger.level = 'info';

    var actionResponse = {path: "path", query: "query", header: "header", body: "body"};
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

                                },
                                {
                                    name: 'long',
                                    in: 'query',
                                    type: 'integer',
                                    format: 'int64'

                                },
                                {
                                    name: 'float',
                                    in: 'query',
                                    type: 'number',
                                    format: 'float'

                                },
                                {
                                    name: 'double',
                                    in: 'query',
                                    type: 'number',
                                    format: 'double'

                                },
                                {
                                    name: 'string',
                                    in: 'query',
                                    type: 'string'

                                },
                                {
                                    name: 'byte',
                                    in: 'query',
                                    type: 'string',
                                    format: 'byte'

                                },
                                {
                                    name: 'bool',
                                    in: 'query',
                                    type: 'boolean'

                                },
                                {
                                    name: 'date',
                                    in: 'query',
                                    type: 'string',
                                    format: 'date'

                                },
                                {
                                    name: 'dateTime',
                                    in: 'query',
                                    type: 'string',
                                    format: 'date-time'

                                },
                                {
                                    name: 'password',
                                    in: 'query',
                                    type: 'string',
                                    format: 'password'

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
                    "/brokenArrayConvert": {
                        get: {
                            parameters: [
                                {
                                    'name': 'def',
                                    'in': 'query',
                                    'type': 'array'
                                }

                            ],
                            $actionHandler: function (def) {
                                return {msg: def};
                            }

                        }
                    },
                    "/defaultArrayConvert": {
                        get: {
                            parameters: [
                                {
                                    'name': 'def',
                                    'in': 'query',
                                    'type': 'array',
                                    'items': {
                                        type: 'string'
                                    }
                                },
                                {
                                    'name': 'csv',
                                    'in': 'query',
                                    'type': 'array',
                                    'collectionFormat': 'csv',
                                    'items': {
                                        type: 'string'
                                    }
                                },
                                {
                                    'name': 'ssv',
                                    'in': 'query',
                                    'type': 'array',
                                    'collectionFormat': 'ssv',
                                    'items': {
                                        type: 'string'
                                    }
                                },
                                {
                                    'name': 'tsv',
                                    'in': 'query',
                                    'type': 'array',
                                    'collectionFormat': 'tsv',
                                    'items': {
                                        type: 'string'
                                    }
                                },
                                {
                                    'name': 'pipes',
                                    'in': 'query',
                                    'type': 'array',
                                    'collectionFormat': 'pipes',
                                    'items': {
                                        type: 'string'
                                    }
                                },
                                {
                                    'name': 'multi',
                                    'in': 'query',
                                    'type': 'array',
                                    'collectionFormat': 'multi',
                                    'items': {
                                        type: 'string'
                                    }
                                }

                            ],
                            $actionHandler: function (def, csv, ssv, tsv, pipes, multi) {
                                return {
                                    def: def,
                                    csv: csv,
                                    ssv: ssv,
                                    tsv: tsv,
                                    pipes: pipes,
                                    multi: multi
                                };
                            }

                        }
                    }
                }
            },
            debug: true
        }
    )
        .hostApp(app);

    suite({
        'setup': tester.init(app),
        'teardown': tester.destroy(),
        'should convert simple types': function () {
            return tester.get('/api/simpleConvert?integer=12345&long=4321&float=123.456&double=654.321&string=string&long=4321&byte=123&bool=true&date=2014-03-02&dateTime=2014-03-02T23:59:01&password=abcde', function (res) {
                expect(res).to.have.status(200);
                var out = {
                    integer: 12345,
                    long: 4321,
                    float: 123.456,
                    double: 654.321,
                    string: 'string',
                    byte: "123",
                    bool: true,
                    date: new Date(Date.UTC(2014, 2, 2, 0, 0, 0)).toJSON(),
                    dateTime: new Date(Date.UTC(2014, 2, 2, 23, 59, 1)).toJSON(),
                    password: "abcde"
                };
                expect(res.body).is.eql(out)
            });
        },
        'should throw exception when convert array without given items section': function () {
            return tester.get('/api/brokenArrayConvert?def=a,b,c,d,e', function (res) {
                expect(res).to.have.status(404);
                expect(res.body).is.eql({
                    msg: 'Action Exception occured',
                    "e": "Parameter def is defined as an array, however there is no defined items property"
                })
            });
        },
        'should convert default csv array of string type': function () {
            return tester.get('/api/defaultArrayConvert?def=d,e,f&csv=c,s,v&ssv=s s v&tsv=t\ts\tv&pipes=p|i|p|e|s&multi=m&multi=u&multi=l&multi=t&multi=i', function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql({
                    def: ['d', 'e', 'f'],
                    csv: ['c', 's', 'v'],
                    ssv: ['s', 's', 'v'],
                    tsv: ['t', 's', 'v'],
                    pipes: ['p', 'i', 'p', 'e', 's'],
                    multi: ['m', 'u', 'l', 't', 'i']
                })
            });
        }

    });
});
