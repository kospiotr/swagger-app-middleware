define(function (require) {
    var suite = require('intern!object');
    var tester = require('../lib/restServerTester');
    var chai = tester.chai;
    var expect = chai.expect;
    var express = require('intern/dojo/node!express');
    var logger = require('intern/dojo/node!winston');
    var swagger = require('intern/dojo/node!../../index');
    var app = express();


    //logger.level = 'debug';

    var operation = {
        "parameters": [
            {
                "name": "path",
                "in": "path",
                "type": "string"
            },
            {
                "name": "query",
                "in": "query",
                "type": "string"
            },
            {
                "name": "header",
                "in": "header",
                "type": "string"
            },
            {
                "name": "body",
                "in": "body",
                "schema": {

                }
            }

        ],
        "responses": {
            "default": {
                "description": "result"
            }
        },
        '$actionHandler': function (path, query, header, body, meta) {
            return {path: path, query: query, header: header, body: body.msg}
        }
    };
    var actionResponse = {path: "path", query: "query", header: "header", body: "body"};
    new swagger.App(
        {
            spec: {
                paths: {
                    "/{path}/action": {
                        "get": operation,
                        "post": operation,
                        "put": operation,
                        "delete": operation
                    }
                }
            },
            debug: true
        }
    ).hostApp(app);

    suite({
        'setup': tester.init(app),
        'teardown': tester.destroy(),
        'should extract parameters from get method': function () {
            return tester.get('/api/path/action?query=query', {msg: 'body'}, [{
                key: 'header',
                value: 'header'
            }], function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql(actionResponse)
            });
        },
        'should extract parameters from post method': function () {
            return tester.post('/api/path/action?query=query', {msg: 'body'}, [{
                key: 'header',
                value: 'header'
            }], function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql(actionResponse)
            });
        },
        'should extract parameters from put method': function () {
            return tester.put('/api/path/action?query=query', {msg: 'body'}, [{
                key: 'header',
                value: 'header'
            }], function (res) {
                expect(res).to.have.status(200);
                expect(res.body).is.eql(actionResponse)
            });
        }
    });
});
