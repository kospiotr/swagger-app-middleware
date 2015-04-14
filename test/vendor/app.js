var requireDir = require('require-dir');
var _ = require('lodash');
var express = require('express');
var app = express();
var swagger = require('../../index.js');
var bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

var swaggerAppMiddleware = new swagger.App({
        spec: {
            //"host": "localhost:8080",
            paths: _.merge(
                requireDir("./paths")
            ),
            definitions: _.merge(
                requireDir("./models")
            )
        },
        debug: true
    }
);

swaggerAppMiddleware.hostApp(app);

app.get('/test', function (req, res) {
    console.log('hitting test');
    res.json({status: 'ok'});
});

console.log('app started');
module.exports = app;

