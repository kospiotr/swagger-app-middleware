define(function (require) {
    var suite = require('intern!object');
    var parameterExtractor = require('intern/dojo/node!../../src/builders/parameterExtractor');
    var expect = require('intern/chai!expect');


    suite({
        'should extract input parameter from all methods': function () {
            var inputReq = {
                query: {
                    queryParam: 'queryValue'
                },
                header: function () {
                    return 'headerValue'
                },
                params: {
                    pathParam: 'pathValue'
                },
                body: {
                    formParam: 'formValue',
                    bodyParam: 'bodyValue'
                }

            };

            var inputSpec = [
                {
                    "name": "queryParam",
                    "in": "query",
                    "type": "string"
                }, {
                    "name": "headerParam",
                    "in": "header",
                    "type": "string"
                }, {
                    "name": "pathParam",
                    "in": "path",
                    "type": "string"
                }, {
                    "name": "bodyParam",
                    "in": "body",
                    "type": "string"
                }
            ];

            var result = parameterExtractor.extractInputParameters(inputReq, inputSpec);
            expect(result).to.eql(['queryValue', 'headerValue', 'pathValue', {
                formParam: 'formValue',
                bodyParam: 'bodyValue'
            }]);
        },
        'should throw exception when unsupported method type was specified': function () {
            var inputSpec = [
                {
                    "name": "queryParam",
                    "in": "non exsisting method type",
                    "type": "string"
                }
            ];

            try {
                parameterExtractor.extractInputParameters(null, inputSpec);
            } catch (e) {
                expect(e).is.eql('Input source: non exsisting method type for parameter: queryParam is not supported');

            }
        }
    });
});