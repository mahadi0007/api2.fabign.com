const { Schema, model, models } = require("mongoose");

const couponSchema = new Schema(
  {
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductV2",
        default: [],
      },
    ],
    coupon_code: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    coupon_amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      trim: true,
      required: true,
    },
    endDate: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      default: "apporved",
      enum: ["apporved", "cancel"],
      trim: true,
    },
    redeemed: {
      type: Number,
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

/**
 * Validates unique promo code
 */
couponSchema.path("coupon_code").validate(async (coupon_code) => {
  const couponCodeCount = await models.Coupon.countDocuments({
    coupon_code,
  });
  return !couponCodeCount;
}, "This coupon code already exists");

module.exports = model("Coupon", couponSchema);
