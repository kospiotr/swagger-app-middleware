define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var logger = require('intern/dojo/node!winston');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();


    //logger.level = 'info';

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
                    }
                    //"/action": {
                    //    "get": {
                    //        "parameters": [
                    //            {
                    //                "name": "query",
                    //                "in": "undef",
                    //                //"type": "string"
                    //            },
                    //        //    {
                    //        //        "name": "query",
                    //        //        "in": "def",
                    //        //        "type": "string"
                    //        //    },
                    //        //    {
                    //        //        "name": "query",
                    //        //        "in": "defDefault",
                    //        //        "type": "string"
                    //        //        //"default": "def"
                    //        //    },
                    //        //    {
                    //        //        "name": "query",
                    //        //        "in": "undefDefault",
                    //        //        "type": "string"
                    //        //        //"default": "def"
                    //        //    }
                    //        //
                    //        ],
                    //        '$actionHandler': function (undef, def, defDefault, undefDefault) {
                    //            return {undef: undef, def: def, defDefault: defDefault, undefDefault: undefDefault}
                    //        }
                    //    }
                    //}
                }
            },
            debug: true
        }
    )
        .hostApp(app);

    suite({
        'setup': tester.init(app),
        'teardown': tester.destroy(),
        'should be good': function () {
            return tester.get('/api/action?undef=undefV&def=defV&defDefault=defDefaultV&undefDefault=undefDefaultV', function (res) {
                //expect(res).to.have.status(200);
                //expect(res.body).is.eql({
                //    undef: "undefV", def: "defV", defDefault: "defDefaultV", undefDefault: "undefDefaultV"
                //})
            });
        }
    });
});
