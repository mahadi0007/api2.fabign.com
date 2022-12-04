const { Schema, model } = require("mongoose");

const stockReasonSchema = new Schema(
  {
    reason: {
      type: String,
      default: 0,
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    is_deleted: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    deleted_at: {
      type: Date,
      trim: true,
    },
    deleted_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("StockReason", stockReasonSchema);
