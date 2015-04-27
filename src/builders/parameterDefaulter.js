var _ = require('lodash');
var logger = require('winston');

var getDefaultedParameter = function(value, parameterSpec) {
    return (value === undefined && parameterSpec.default) ? parameterSpec.default : value;
};

var getDefaultedParameters = function (parameterValues, parameterSpecs) {
    var out = [];
    _.forEach(parameterSpecs, function (parameterSpec, index) {
        var value = parameterValues[index];
        out.push(getDefaultedParameter(value, parameterSpec));

    });
    return out;
};

module.exports = {
    getDefaultedParameters: getDefaultedParameters,
    getDefaultedParameter: getDefaultedParameter
};