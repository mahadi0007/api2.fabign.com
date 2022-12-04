const route = require("express").Router();
const { Customer } = require("../../common/middleware/Permission");
const CouponController = require("../controller/Coupon");
route.post("/findCoupon", Customer, CouponController.findCoupon);
module.exports = route;
