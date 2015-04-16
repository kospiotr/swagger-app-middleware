var requireDir = require('require-dir');
var _ = require('lodash');
var express = require('express');
var app = express();
var swagger = require('../../index.js');
var bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

var config = {
    spec: {
        paths: _.merge(_.values(requireDir("./paths"))[0]),

        definitions: _.merge(_.values(requireDir("./models")))
    },
    debug: true
};
//console.log(config.spec.paths);
var swaggerAppMiddleware = new swagger.App(config
);
//console.log(requireDir("./paths"));

swaggerAppMiddleware.hostApp(app);

app.get('/test', function (req, res) {
    console.log('hitting test');
    res.json({status: 'ok'});
});

console.log('app started');
module.exports = app;

