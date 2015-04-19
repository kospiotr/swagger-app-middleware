var _ = require('lodash');
var logger = require('winston');

/**
 * Returns input parameter value based on request and parameter specification object. Example input:
 <pre> {
   "name": "limit",
   "in": "query",
   "description": "maximum number of results to return",
   "required": false,
   "type": "integer",
   "format": "int32"
 }</pre>
 * @param req
 * @param parameterSpec parameters spec object
 *
 * @returns {Object}
 */

var extractInputParameter = function (req, parameterSpec) {
    var parameterName = parameterSpec.name,
        parameterMethodType = parameterSpec.in;

    if (parameterMethodType === 'query') {
        return req.query[parameterName];
    }
    
    if (parameterMethodType === 'header') {
        return req.header(parameterName);
    } 
    
    if (parameterMethodType === 'path') {
        return req.params[parameterName];
    }
    
    if (parameterMethodType === 'body') {
        return req.body;
    }
    
    throw 'Input source: ' + parameterMethodType + ' for parameter: ' + parameterName + ' is not supported';
};

/**
 * Returns input parameters value based on request and parameter specification array. Example input:
 <pre> [{
   "name": "limit",
   "in": "query",
   "description": "maximum number of results to return",
   "required": false,
   "type": "integer",
   "format": "int32"
 },{
   "name": "name",
   "in": "query",
   "description": "query filter",
   "required": false,
   "type": "string"
 }]</pre>
 * @param req
 * @param parameterSpec parameters spec array
 *
 * @returns {Array}
 */
var extractInputParameters = function (req, parametersSpec) {
    var out = [];
    _.forIn(parametersSpec, function (parameterSpec) {
        out.push(extractInputParameter(req, parameterSpec));
    });
    return out;
};

module.exports = {
    extractInputParameter: extractInputParameter,
    extractInputParameters: extractInputParameters
}