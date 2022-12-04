const { Schema, model } = require("mongoose");

const sliderSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: false,
    },
    title: {
      type: String,
      trim: true,
      required: false,
    },
    details: {
      type: String,
      trim: true,
      required: false,
    },
    publish: {
      type: Boolean,
      default: true,
    },
    banner: {
      type: String,
      trim: true,
      required: true,
    },
    hyperlink: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Slider", sliderSchema, "slider");
