var hostSpec = function (expressApp, spec, specPath) {
    expressApp.get(specPath, function (req, res) {
        res.json(spec);
    });
};

module.exports = {
    hostSpec: hostSpec

}; 