var _ = require('lodash');

var allowedMethods = ['get', 'post', 'put', 'delete'];

var handleOperation = function (app, method, path, callback) {
    if (_.includes(allowedMethods, method)) {
        console.log(app[method]);
        app[method].apply(null, [path, callback]);
    } else {
        throw 'Unknow method type: ' + method;
    }
};

var hostHandlers = function (expressApp, operationHandlers) {
    _.forEach(operationHandlers, function(operationHandler){
        handleOperation(
            expressApp, 
            operationHandler.method, 
            operationHandler.path, 
            operationHandler.handler
        );
    })
};

module.exports = {
    hostHandlers: hostHandlers

}; 