var _ = require('lodash');


/**
 * Normalize spec to make easier work on object with additional meta data
 * Example input: <pre>
 {
   "spec": {
     "swagger": "2.0",
     "info": {
       "version": "1.0.0",
       "title": "Sample swagger based app"
     },
     "host": "http://localhost:8080",
     "basePath": "/api",
     "schemes": [
       "http"
     ],
     "paths": {
       "/pets": {
         "get": {
           "responses": {
             "200": {
               "schema": {
                 "type": "string"
               }
             },
             "default": {
               "description": "unexpected error"
             }
           }
         }
       }
     },
     "definitions": {
     "  Pet": {
         "required": [
           "id",
           "name"
         ],
         "properties": {
           "id": {
             "type": "integer",
             "format": "int64"
           },
           "name": {
             "type": "string"
           },
           "tag": {
             "type": "string"
           }
         }
       }
     }
   }
 }
 * </pre>
 * @param spec
 * @param normalizedPaths
 * @returns {*}
 */
var normalizeSpec = function (spec) {
    var context = _.cloneDeep(spec);
    return context;
};

module.exports = {
    normalizeSpec: normalizeSpec

}; 