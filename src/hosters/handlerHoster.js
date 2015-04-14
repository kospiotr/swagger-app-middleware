var _ = require('lodash');


var handleOperation = function (app, method, path, callback) {
    if (method === 'get') {
        app.get(path, callback);
    } else if (method === 'post') {
        app.post(path, callback);
    } else if (method === 'put') {
        app.put(path, callback);
    } else if (method === 'delete') {
        app.delete(path, callback);
    } else {
        throw 'Unhandled method type: ' + method;
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