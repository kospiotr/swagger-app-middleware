define(function (require) {
    var suite = require('intern!object');
    var parameterConverter = require('intern/dojo/node!../../src/builders/parameterConverter');
    var expect = require('intern/chai!expect');


    suite({
        'should convert to integer parameter': function () {
            expect(parameterConverter.convertParameterObject('12345', {type:'integer', format:'int32'})).to.eql(12345);
        },
        'should convert to long parameter': function () {
            expect(parameterConverter.convertParameterObject('12345', {type:'integer', format:'int64'})).to.eql(12345);
        },
        'should convert to float parameter': function () {
            expect(parameterConverter.convertParameterObject('12.345', {type:'number', format:'float'})).to.eql(12.345);
        },
        'should convert to double parameter': function () {
            expect(parameterConverter.convertParameterObject('12.345', {type:'number', format:'double'})).to.eql(12.345);
        },
        'should convert string parameter': function () {
            expect(parameterConverter.convertParameterObject('abc', {type:'string'})).to.eql("abc");
        },
        'should convert byte parameter': function () {
            expect(parameterConverter.convertParameterObject('abc', {type:'string', format:'byte'})).to.eql("abc");
        },
        'should convert boolean parameter': function () {
            expect(parameterConverter.convertParameterObject('true', {type:'boolean'})).to.eql(true);
        },
        'should convert date parameter': function () {
            expect(parameterConverter.convertParameterObject('2015-09-29', {type:'string', format:'date'})).to.eql(new Date('2015-09-29'));
        },
        'should convert dateTime parameter': function () {
            expect(parameterConverter.convertParameterObject('2015-09-29T23:59:59', {type:'string', format:'date-time'})).to.eql(new Date('2015-09-29T23:59:59'));
        },
        'should throw exception when configuration not found': function () {
            try {
                parameterConverter.convertParameterObject('abc', {type:'aaa', format:'bbb'});
            } catch (e) {
                expect(e).is.eql('Could not convert value: abc, for type: aaa, format: bbb, items: undefined, collectionFormat: undefined');
            }
        },
        'should convert csv array': function () {
            expect(parameterConverter.convertParameterObject("foo,bar", {
                "name": "tags",
                "in": "query",
                "type": "array",
                "items": {
                    "type": "string"
                }
            })).to.eql(['foo', 'bar']);
        },
        'should convert ssv array': function () {
            expect(parameterConverter.convertParameterObject("foo bar", {
                "name": "tags",
                "in": "query",
                "type": "array",
                "items": {
                    "type": "string"
                },
                collectionFormat: 'ssv'
            })).to.eql(['foo', 'bar']);
        },
        'should convert tsv array': function () {
            expect(parameterConverter.convertParameterObject("foo\tbar", {
                "name": "tags",
                "in": "query",
                "type": "array",
                "items": {
                    "type": "string"
                },
                collectionFormat: 'tsv'
            })).to.eql(['foo', 'bar']);
        },
        'should convert pipes array': function () {
            expect(parameterConverter.convertParameterObject("foo|bar", {
                "name": "tags",
                "in": "query",
                "type": "array",
                "items": {
                    "type": "string"
                },
                collectionFormat: 'pipes'
            })).to.eql(['foo', 'bar']);
        },
        'should throw exception when unknown collectionFormatwhile converting array': function () {
            try {
                parameterConverter.convertParameterObject("foo|bar", {
                    "name": "tags",
                    "in": "query",
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    collectionFormat: 'aaa'
                });
                expect.fail('expect exception to be thrown');
            }catch(e){
                expect(e).to.not.null;
            }
        },
        'should convert to integer array': function () {
            expect(parameterConverter.convertParameterObject("123,456", {
                "name": "tags",
                "in": "query",
                "type": "array",
                "items": {
                    "type": "integer",
                    "format": "int32"
                }
            })).to.eql([123, 456]);
        }
    });
});