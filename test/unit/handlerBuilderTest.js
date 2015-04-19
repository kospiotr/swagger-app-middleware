define(function (require) {
    var suite = require('intern!object'),
        expect = require('intern/chai!expect'),
        instance = require('intern/dojo/node!../../src/builders/handlerBuilder');

    suite(
        {
            'shouldFlatternsOperations': function () {
                var result = instance.flatternOperations(
                    {
                        "/pets": {
                            "get": {
                                "summary": "get pets",
                                "responses": {
                                    "default": {
                                        "description": "unexpected error"
                                    }
                                }
                            }
                        },
                        "/toys": {
                            "get": {
                                "summary": "get toys",
                                "responses": {
                                    "default": {
                                        "description": "unexpected error"
                                    }
                                }
                            }
                        }
                    }
                );
                expect(result).to.have.deep.property('[0].path', '/pets');
                expect(result).to.have.deep.property('[0].method', 'get');
                expect(result).to.have.deep.property('[0].summary', 'get pets');
                expect(result).to.have.deep.property('[1].path', '/toys');
                expect(result).to.have.deep.property('[1].method', 'get');
                expect(result).to.have.deep.property('[1].summary', 'get toys');
            },
            'shouldConvertPathFromSwaggerToExpressSimple': function () {
                var result = instance.convertPathFromSwaggerToExpress("/{path}");
                expect(result).to.eql('/:path');
            },
            'shouldConvertPathFromSwaggerToExpressComplex': function () {
                var result = instance.convertPathFromSwaggerToExpress("/user/{uid}/photos/{file}");
                expect(result).to.eql('/user/:uid/photos/:file');
            }
        }
    );
});