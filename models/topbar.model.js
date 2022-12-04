const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const topbar = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    icon: {
      type: String,
      trim: true,
      required: true,
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    is_default: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    is_hidden: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TopBar = model("topbar", topbar);
module.exports = TopBar;
