const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../common/helper/responseStatus");
const Order = require("../../models/Order/Order");
class OrderStat {
  async getOrderCounter(req, res, next) {
    try {
      let newOrder = await Order.countDocuments({
        status: "created",
      });
      let pendingOrder = await Order.countDocuments({
        status: "pending",
      });
      let deliveryOrder = await Order.countDocuments({
        status: "delivered",
      });
      let cancelledOrder = await Order.countDocuments({
        status: "cancelled",
      });
      let confirmedOrder = await Order.countDocuments({
        status: "confirmed",
      });
      return success(res, "Found all order count", {
        newOrder,
        pendingOrder,
        deliveryOrder,
        cancelledOrder,
        confirmedOrder,
      });
    } catch (error) {
      failure(res, error.message, {});
    }
  }
  async getOrderCounterOfUser(req, res, next) {
    try {
      let newOrder = await Order.countDocuments({
        user: req.user.id,
        status: "created",
      });
      let pendingOrder = await Order.countDocuments({
        user: req.user.id,
        status: "pending",
      });
      let deliveryOrder = await Order.countDocuments({
        user: req.user.id,
        status: "delivered",
      });
      let cancelledOrder = await Order.countDocuments({
        user: req.user.id,
        status: "cancelled",
      });
      let confirmedOrder = await Order.countDocuments({
        user: req.user.id,
        status: "confirmed",
      });
      return success(res, "Found all order count", {
        newOrder,
        pendingOrder,
        deliveryOrder,
        cancelledOrder,
        confirmedOrder,
      });
    } catch (error) {
      failure(res, error.message, {});
    }
  }
}

module.exports = new OrderStat();
