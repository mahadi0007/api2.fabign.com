const router = require("express").Router();
const couponRouter = require("./routes/coupon");
router.use("/", couponRouter);
module.exports = router;
