var _ = require('lodash');
var logger = require('winston');
//var parameterConverter = require('./parameterConverter');
//var arrayTransformator = require('./arrayTransformator');


/**
 * Extracting parameter by method type
 * @param req
 * @param parameterSpec, where:
 *  - parameterName
 *  - parameterMethodType allowed values: "query", "header", "path" or "body"
 */
var extractInputParameterByMethodType = function (req, parameterSpec) {
    var parameterName = parameterSpec.name,
        parameterMethodType = parameterSpec.in,
        collectionFormat = parameterSpec.collectionFormat;

    
    //logger.debug('parameterSpec: ', parameterSpec);
    //logger.debug('collectionFormat: ' + collectionFormat);

    logger.debug(req.body);
    
    logger.debug('Params', req.params);
    var out = undefined;
    if (parameterMethodType === 'query') {
        out = req.query[parameterName];
        //out = collectionFormat !== 'multi' && _.isArray(out) ?
        //    arrayTransformator.join(out, collectionFormat) :
        //    out;
    } else if (parameterMethodType === 'header') {
        out = req.header(parameterName);
    } else if (parameterMethodType === 'path') {
        //logger.debug('params: ', req.params);
        out = req.params[parameterName];
    } else if (parameterMethodType === 'body') {
        out = req.body;
    } else {
        logger.debug('Exception');
        throw 'Unsupported parameter method type: ' + parameterMethodType + ', for parameter: ' + parameterName;
    }
    logger.debug('parameter extracted: ' + parameterName+' of type: '+ parameterMethodType + ': ' + out);
    return out;
};
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
    var parameterOriginalValue = extractInputParameterByMethodType(req, parameterSpec);
    //if (parameterOriginalValue == null) {
    return parameterOriginalValue;
    //}
    //var parameterConvertedValue = parameterConverter.convertParameterObject(parameterOriginalValue, parameterSpec);
    //return parameterConvertedValue;
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