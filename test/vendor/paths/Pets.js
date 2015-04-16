module.exports = {

    "/pets": {
        "get": {
            description: "test description",
            "responses": {
                "default": {
                    "description": "result"
                }
            },
            '$actionHandler': function (meta) {
                return {msg: "pets action"}
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
            '$requestHandler': function(req, res){
                res.json({msg: "toys action"});
            }
        }

    },
    "/zebras": {
        "get": {
            "responses": {
                "default": {
                    "description": "result"
                }
            },
            '$requestHandler': function(req, res){
                res.json({msg: "zebras action"});
            }
        }

    }

};