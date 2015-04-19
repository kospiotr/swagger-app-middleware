var logger = require('intern/dojo/node!winston');
var app = require('./app');
app.listen(8081);
logger.debug('Application is running on port 8081');

