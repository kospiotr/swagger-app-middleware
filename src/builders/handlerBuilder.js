var _ = require('lodash');
var parameterExtractor = require('./parameterExtractor');
var parameterConverter = require('./parameterConverter');
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
            var actionInputParameters = parameterExtractor.extractInputParameters(req, operation.parameters);
            //var actionInputParameters = parameterConverter.convertInputParameters(actionInputParameters, operation.parameters);
            var meta = {req: req, res: res, operation: operation};
            var inputParameters = _.merge([], actionInputParameters, meta);
            var actionResult = actionHandler.apply(actionHandler, inputParameters);
            logger.debug('Result %j', actionResult);
            res.json(actionResult);
        }catch(e){
            logger.debug('Exception', e);
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
        var operationHandler = {
            path: spec.basePath + convertPathFromSwaggerToExpress(operation.path),
            method: operation.method,
            handler: buildHandlerForOperation(operation, config)
        };
        logger.debug('Operation handling', operationHandler);
        out.push(operationHandler);
    });
    return out;
};

module.exports = {
    buildOperationHandlers: buildOperationHandlers,
    flatternOperations: flatternOperations,
    convertPathFromSwaggerToExpress: convertPathFromSwaggerToExpress
};