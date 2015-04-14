module.exports = {

    "/pets": {
        "get": {
            "responses": {
                "default": {
                    "description": "result"
                }
            },
            '$action': function (meta) {
                return {msg: "message"}
            }
        }

    },
    "/toys": {
        "get": {
            "responses": {
                "default": {
                    "description": "result"
                }
            },
            '$request': function(req, res){

            }
        }

    }

};