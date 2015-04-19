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
 * @param extractedInputParameter
 * @param parameterSpec parameters spec object
 *
 * @returns {Object}
 */

var convertInputParameter = function (extractedInputParameter, parameterSpec) {
    return extractedInputParameter;
};

/**
 * Returns converted input parameters value based on extracted parameters from request and parameter specification array. Example input:
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
 * @param extractedParameters extracted input parameters array
 * @param parameterSpec parameters spec array
 *
 * @returns {Array}
 */
var convertInputParameters = function (extractedParameters, parametersSpec) {
    var out = [];
    _.forIn(parametersSpec, function (parameterSpec, index) {
        out.push(convertInputParameter(extractedParameters[index], parameterSpec));
    });
    return out;
};

module.exports = {
    convertInputParameter: convertInputParameter,
    convertInputParameters: convertInputParameters
}