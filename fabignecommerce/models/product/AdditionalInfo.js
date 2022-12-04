const { Schema, model } = require("mongoose")

const additionalInfo = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'ProductV2'
    },
    info: [{
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        }
    }]
},
    {
        timestamps: true
    })


module.exports = model("additionalInfo", additionalInfo);
