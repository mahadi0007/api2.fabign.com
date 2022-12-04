const { Schema, model } = require("mongoose");

const topbarButton = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
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

const TopBarButton = model("topbar_button", topbarButton);
module.exports = TopBarButton;
