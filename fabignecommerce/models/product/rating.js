const { Schema, model } = require("mongoose");

const ratingReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    images: {
      type: [String],
      default: [],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    rating: {
      type: Number,
      trim: true,
      default: null,
    },
    review: {
      type: String,
      trim: true,
      default: "",
    },
    approved: {
      type: Boolean,
      default: false,
    },
    reply: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          default: "",
        },
        time: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("RatingReview", ratingReviewSchema);
