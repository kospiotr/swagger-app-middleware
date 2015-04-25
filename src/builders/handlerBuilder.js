var _ = require('lodash');
var parameterExtractor = require('./parameterExtractor');
var parameterConverter = require('./parameterConverter');
var parameterValidator = require('./parameterValidator');
var schemaValidator = require('../validation/schemaValidator');
var logger = require('winston');

/**
 * Flatterns paths into operations
 * Example input:
 * <pre>{
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
}</pre>
 Output:
<pre>
 [
 {
   path: '/pets',
   method: 'get',
   summary: 'get pets',
   responses: {default: [Object]}
 },
 {
   path: '/toys',
   method: 'get',
   summary: 'get toys',
   responses: {default: [Object]}
 }
 ]
</pre>
 * @param paths
 * @returns {Array}
 */
var flatternOperations = function (paths) {
    var operations = [];
    _.forEach(paths, function (pathObj, path) {
        _.forEach(pathObj, function (operationObj, method) {
            var newOperation = _.merge({
                path: path,
                method: method
            }, operationObj);
            operations.push(newOperation);
        });
    });
    return operations;
};

var buildActionHandlerForOperation = function (actionHandler, operation, actionExceptionHandler) {
    return function (req, res) {
        try {
            logger.debug('Handling operation: [' + operation.method + '] ' + operation.path);
            var actionInputParameters = parameterExtractor.extractInputParameters(req, operation.parameters);
            logger.debug('Extracted parameters', actionInputParameters);
            var actionInputParameters = parameterConverter.convertParameterObjects(actionInputParameters, operation.parameters);
            logger.debug('Converted parameters', actionInputParameters);

            var validationErrors = parameterValidator.getParameterObjectsValidationErrors(actionInputParameters, operation);
            logger.debug('Validation errors', actionInputParameters);
            if(validationErrors.length > 0){
                throw {
                    msg: 'Validation exception',
                    errors: validationErrors
                }                
            }
            var meta = {req: req, res: res, operation: operation};
            var inputParameters = _.merge([], actionInputParameters, meta);
            var actionResult = actionHandler.apply(actionHandler, inputParameters);
            logger.debug('Action result', actionResult);
            res.json(actionResult);
        }catch(e){
            logger.debug('Action exception', e);
            actionExceptionHandler(e,req,res);
        }
    };
};

var buildHandlerForOperation = function (operation, config) {
    var requestHandler = operation['$requestHandler'];
    if(_.isFunction(requestHandler)){
        return requestHandler;
    }
    var actionHandler = operation['$actionHandler'];
    if(_.isFunction(actionHandler)) {
        var operationActionExceptionHandler = operation['$actionExceptionHandler'];
        var actionExceptionHandler = operationActionExceptionHandler ?
            operationActionExceptionHandler :
            config.actionExceptionHandler;
        return buildActionHandlerForOperation(actionHandler, operation, actionExceptionHandler);
    }
    return config.unhandledOperationExceptionHandler;
};

/**
 * Converts Swagger PATH templates /{path} into ExpressJS: /:path
 * @param path
 * @param method
 */
var convertPathFromSwaggerToExpress = function (path) {
    return path.replace(/{(.*?)}/g,":$1");
};

var buildOperationHandlers = function (spec, config) {
    var out = [];
    var operations = flatternOperations(spec.paths);
    _.forEach(operations, function (operation) {

        _.forEach(operation.parameters, function(parameter){
            parameter.$validator = parameter.$validator ? parameter.$validator : parameterValidator.createValidatorForParameters(parameter, spec);
        });
        var operationHandler = {
            path: spec.basePath + convertPathFromSwaggerToExpress(operation.path),
            method: operation.method,
            handler: buildHandlerForOperation(operation, config)
        };
        out.push(operationHandler);
    });
    return out;
};

module.exports = {
    buildOperationHandlers: buildOperationHandlers,
    flatternOperations: flatternOperations,
    convertPathFromSwaggerToExpress: convertPathFromSwaggerToExpress
};