const router = require("express").Router();
const deliveryRouter = require("../server/delivery/index");
const Helper = require("../common/helper/index");
const { Admin } = require("../../api/middleware/permission.middleware");

router.get("/", (req, res) => {
  console.log("hello");
  res.json({ test: "Hello App is running" });
});
router.use("/products", require("../products/index"));
router.use("/user", require("../user/index"));
router.use("/order", require("../order/index"));
router.use("/auth", require("../auth/index"));
router.use("/banner", require("../banner/bannerRoute"));
router.use("/slider", require("../slider/sliderRoute"));
router.use("/coupon", require("../coupon/index"));
router.use("/delivery", deliveryRouter);
router.post("/upload/files/", Admin, Helper.fileUploaderForProduct);

module.exports = router;
