const { Schema, model } = require("mongoose")

const faqSection = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'ProductV2'
    },
    faq: [{
        question: {
            type: String,
            default: ''
        },
        answer: {
            type:String,
            default: ''
        }
    }]
},
    {
        timestamps: true
    })


module.exports = model("FAQ", faqSection);
