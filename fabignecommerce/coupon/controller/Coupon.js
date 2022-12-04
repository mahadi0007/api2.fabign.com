const {
  success,
  failure,
  notFound,
} = require("../../common/helper/responseStatus");
const Coupon = require("../../../models/coupon.model");

class CouponController {
  async findCoupon(req, res, next) {
    try {
      const { coupon_code } = req.body;
      let coupon = await Coupon.findOne({
        coupon_code,
      }).lean({});
      return coupon
        ? success(res, "Fetched coupon", coupon)
        : notFound(res, "No content found", {});
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
}

module.exports = new CouponController();
