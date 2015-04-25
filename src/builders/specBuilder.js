var _ = require('lodash');

var removeHandlersObjects = function (normalizedSpec) {
    if (_.isObject(normalizedSpec) || _.isArray(normalizedSpec)) {
        _.forEach(normalizedSpec, function (value, key) {
            if (_.contains(['$actionHandler', '$requestHandler', '$actionExceptionHandler'], key)) {
                delete normalizedSpec[key];
            }
            removeHandlersObjects(value);
        });
    }
    return normalizedSpec;
};

var addDefaultResponses = function (spec, defaultResponse) {
    _.forEach(spec.paths, function (methods, path) {
        _.forEach(methods, function (operation, method) {
            if (!_.has(operation, 'responses')) {
                operation.responses = defaultResponse;
            }
        });
    });
};

var buildSpec = function (normalizedSpec, config) {
    var out = _.cloneDeep(normalizedSpec);
    removeHandlersObjects(out);
    if (config.defaultResponse) {
        addDefaultResponses(out, config.defaultResponse);
    }
    return out;
};

module.exports = {
    buildSpec: buildSpec
};