const { Schema, model } = require("mongoose");

const stockHistorySchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variationId: {
    type: Schema.Types.ObjectId,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  previousStock: {
    type: Number,
    default: 0,
    required: true,
  },
  stockIn: {
    type: Number,
    default: 0,
  },
  stockOut: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
    required: true,
  },
  reason: {
    type: Schema.Types.ObjectId,
    ref: "StockReason",
    required: true,
  },
  time: {
    type: Date,
    default: new Date(),
  },
});

module.exports = model("StockHistory", stockHistorySchema);
