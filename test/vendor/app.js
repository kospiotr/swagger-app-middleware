var requireDir = require('require-dir');
var _ = require('lodash');
var express = require('express');
var app = express();
var swagger = require('../../index.js');

var swaggerAppMiddleware = new swagger.App({
        spec: {
            paths: _.merge(_.values(requireDir("./paths"))[0]),
            definitions: _.merge(_.values(requireDir("./models"))[0])
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

