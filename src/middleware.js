var _ = require('lodash');

//var specValidator = require('./validators/specValidator');

var handlerBuilder = require('./builders/handlerBuilder');
var specBuilder = require('./builders/specBuilder');

var handlerHoster = require('./hosters/handlerHoster');
//var specHoster = require('./hosters/specHoster');
//var uiHoster = require('./hosters/uiHoster');
//var debugHoster = require('./hosters/debugHoster');

var defaultConfigValues = {
    spec: {

        "swagger": "2.0",
        "info": {
            "version": "1.0.0",
            "title": "Sample swagger based app"
        },
        "host": 'http://localhost:8080',
        "basePath": "/api",
        "schemes": [
            "http"
        ],
        paths: {}

    },
    specPath: "/spec.json",
    uiPath: '/api-doc',
    unhandledOperationExceptionHandler: function (req, res) {
        res.status(404);
        res.send({msg: 'Unhandled operation'});
    },
    actionExceptionHandler: function (e, req, res) {
        res.status(404);
        res.send({msg: 'Action Exception occured', e: e});
    },
    debug: false
};

var App = function (config) {
    var me = this;
    this.config = _.merge({},defaultConfigValues, config);

    this.context = _.cloneDeep(this.config.spec);
    this.spec = specBuilder.buildSpec(this.context);
    //specValidator.assureSwaggerSpecValid(this.spec);

    this.operationHandlers = handlerBuilder.buildOperationHandlers(this.context, this.config);

    this.hostApp = function (expressApp) {
        handlerHoster.hostHandlers(expressApp, me.operationHandlers, me.config);
        //specHoster.hostSpec(expressApp, this.spec, this.config.specPath);
        //if (config.hostUi) {
        //    uiHoster.hostUi(expressApp, this.config.uiPath, this.config.specPath);
        //}
        if (config.debug) {
            expressApp.get("/debug", function (req, res) {
                res.json(me);
            });
        }
    };

};

module.exports = {
    App: App
};