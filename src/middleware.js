var _ = require('lodash');

//var specValidator = require('./validators/specValidator');

var logger = require('winston');
var handlerBuilder = require('./builders/handlerBuilder');
var specBuilder = require('./builders/specBuilder');

var handlerHoster = require('./hosters/handlerHoster');
var specHoster = require('./hosters/specHoster');
var swaggerUiMiddleware = require('swagger-ui-middleware');
var bodyParser = require('body-parser');

var currentDir = __dirname;
//var debugHoster = require('./hosters/debugHoster');

var defaultConfigValues = {
    spec: {

        "swagger": "2.0",
        "info": {
            "version": "1.0.0",
            "title": "Sample swagger based app"
        },
        "basePath": "/api",
        "schemes": [
            "http"
        ],
        paths: {}

    },
    unhandledOperationExceptionHandler: function (req, res) {
        res.status(404);
        res.send({msg: 'Unhandled operation'});
    },
    actionExceptionHandler: function (e, req, res) {
        res.status(404);
        res.send({msg: 'Action Exception occured', e: e});
    },
    specPath: "/spec.json",
    uiPath: '/api-doc',
    hostUi: true,
    uiOverridePath: currentDir + '/swagger-ui',
    debug: false
};

var App = function (config) {
    var me = this;
    this.config = _.merge({}, defaultConfigValues, config);

    this.context = _.cloneDeep(this.config.spec);
    this.spec = specBuilder.buildSpec(this.context);
    //specValidator.assureSwaggerSpecValid(this.spec);

    this.operationHandlers = handlerBuilder.buildOperationHandlers(this.context, this.config);

    logger.debug("Build operation handlers", this.operationHandlers);
    this.hostApp = function (expressApp) {
        expressApp.use(bodyParser.json());       // to support JSON-encoded bodies
        expressApp.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

        handlerHoster.hostHandlers(expressApp, me.operationHandlers, me.config);
        specHoster.hostSpec(expressApp, this.spec, this.config.specPath);
        if (this.config.hostUi) {
            //logger.debug('Hosting UI: ' + this.config.uiOverridePath);
            swaggerUiMiddleware.hostUI(expressApp, {path: this.config.uiPath, overrides: this.config.uiOverridePath});
        }
        if (this.config.debug) {
            expressApp.get("/debug", function (req, res) {
                res.json(me);
            });
        }
    };

};

module.exports = {
    App: App
};