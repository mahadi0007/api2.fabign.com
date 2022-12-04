const route = require("express").Router();
const { Customer } = require("../../common/middleware/Permission");
const OrderStatController = require("../controller/OrderStat");

route.get("/count-all-status-order", OrderStatController.getOrderCounter);
route.get(
  "/count-user-all-status-order",
  Customer,
  OrderStatController.getOrderCounterOfUser
);

module.exports = route;
