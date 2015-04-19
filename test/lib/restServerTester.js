define(function (require) {
    var me = this;
    var portfinder = require('intern/dojo/node!portfinder'); //dellivers promieses implementation used in setup method
    var _ = require('intern/dojo/node!lodash');
    var chai = require('intern/dojo/node!chai'); //dellivers promieses implementation used in setup method
    var chaiHttp = require('intern/dojo/node!chai-http'); //dellivers promieses implementation used in setup method
    var q = require('intern/dojo/node!q'); //dellivers promieses implementation used in setup method
    var logger = require('intern/dojo/node!winston');
    me.chai = chai;

    me.init = function (app) {
        return function () {
            var defer = q.defer();
            chai.use(chaiHttp); //configure chai with chaiHttp
            chai.request.addPromises(q.Promise); //configure promise for chaiHttp

            portfinder.getPort(function (err, port) {
                me.port = port;
                me.host = 'http://localhost:' + me.port;
                me.server = app.listen(me.port, function () {
                    logger.debug('server is running on port %j', me.port);
                    defer.resolve();
                });
            });
            return defer.promise;
        };
    };

    me.destroy = function () {
        return function () {
            me.server.close();
            logger.debug('server closed on port: %j', me.port);
        };
    };

    me.api = function () {
        return chai.request(me.host);
    };

    me.send = function (path, method, payloadOrCallback, headersOrCallback, callback) {
        if (!_.isFunction(payloadOrCallback)) {
            if (!_.isFunction(headersOrCallback)) {
            logger.debug('Sending ' + method + ' method to '+ path + ' with payload: ' +payloadOrCallback +', and with headers: ' + headersOrCallback);
                var req = api()[method](path).send(payloadOrCallback);
                _.each(headersOrCallback, function (header) {
                    req = req.set(header.key, header.value);
                });
                return req.then(callback);
            } else {
            logger.debug('Sending ' + method + ' method to '+ path + ' with payload: ' +payloadOrCallback);
                return api()[method](path).send(payloadOrCallback).then(headersOrCallback);
            }
        } else {
            logger.debug('Sending ' + method + ' method to '+ path);
            return api()[method](path).then(payloadOrCallback);
        }
    };

    me.get = function (path, payloadOrCallback, headersOrCallback, callback) {
        return me.send(path, "get", payloadOrCallback, headersOrCallback, callback);
    };

    me.post = function (path,payloadOrCallback, headersOrCallback, callback) {
        return me.send(path, "post", payloadOrCallback, headersOrCallback, callback);
    };

    me.put = function (path, payloadOrCallback, headersOrCallback, callback) {
        return me.send(path, "put", payloadOrCallback, headersOrCallback, callback);
    };

    me.delete = function (path, payloadOrCallback, headersOrCallback, callback) {
        return me.send(path, "delete", payloadOrCallback, headersOrCallback, callback);
    };

    return me;
});