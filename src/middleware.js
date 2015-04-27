var _ = require('lodash'),
    logger = require('winston'),
    handlerBuilder = require('./builders/handlerBuilder'),
    specBuilder = require('./builders/specBuilder'),
    schemaValidator = require('./validation/schemaValidator'),
    handlerHoster = require('./hosters/handlerHoster'),
    specHoster = require('./hosters/specHoster'),
    swaggerUiMiddleware = require('swagger-ui-middleware'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    currentDir = __dirname;

var validateSwaggerSchema = function (data, specSchemaPath) {
    var specSchemaAsString = fs.readFileSync(specSchemaPath, 'utf8');
    var schema = JSON.parse(specSchemaAsString);

    schemaValidator.validateSchema(data, schema);
};

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
    defaultResponse: {
        default: {
            "description": "Request response"
        }
    },
    specPath: "/spec.json",
    uiPath: '/api-doc',
    hostUi: true,
    uiOverridePath: currentDir + '/swagger-ui',
    debug: false,
    specSchemaPath: currentDir + '/../node_modules/swagger-schema-official/schema.json'
};

var App = function (config) {
    var me = this;
    this.config = _.merge({}, defaultConfigValues, config);

    this.context = _.cloneDeep(this.config.spec);
    this.spec = specBuilder.buildSpec(this.context, this.config);
    validateSwaggerSchema(this.spec, this.config.specSchemaPath);

    this.operationHandlers = handlerBuilder.buildOperationHandlers(this.context, this.config);
    this.hostApp = function (expressApp) {
        expressApp.use(bodyParser.json());       // to support JSON-encoded bodies
        expressApp.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

        handlerHoster.hostHandlers(expressApp, me.operationHandlers, me.config);
        specHoster.hostSpec(expressApp, me.spec, me.config.specPath);
        if (me.config.hostUi) {
            swaggerUiMiddleware.hostUI(expressApp, {path: me.config.uiPath, overrides: me.config.uiOverridePath});
        }
        if (me.config.debug) {
            expressApp.get("/debug", function (req, res) {
                res.json(me);
            });
        }
    };

};

module.exports = {
    App: App
};