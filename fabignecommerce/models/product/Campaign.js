const {Schema, model} = require("mongoose");

const CampaignSchema = new Schema({
    images: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "published", "block", "sold", "cancelled", "carted"]
    },
    dateOnly:{
        type: String,
        required: true
    },
    month: {
        type: String,
        trim: true
    },
    year: {
        type: String,
        trim: true
    }
});