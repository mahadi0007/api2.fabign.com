const router = require("express").Router();
const orderRouter = require("./routes/order");
const orderStatRoute = require("./routes/orderstat");
router.use("/", orderRouter);
router.use("/stat/", orderStatRoute);
module.exports = router;
