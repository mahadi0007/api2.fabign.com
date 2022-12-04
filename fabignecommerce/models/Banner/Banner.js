const { Schema, model } = require("mongoose");

let bannerSchema = new Schema({
  banner: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: false,
    trim: true,
  },
  subTitle: {
    type: String,
    required: false,
    trim: true,
  },
  details: {
    type: String,
    required: false,
    trim: true,
  },
  published: {
    type: Boolean,
    default: true,
  },
  hyperlink: {
    type: String,
    trim: true,
    required: true,
  },
});

module.exports = model("Banner", bannerSchema, "banner");
