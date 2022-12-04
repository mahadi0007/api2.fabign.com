const route = require("express").Router();
const { Customer } = require("../../common/middleware/Permission");
const OrderController = require("../controller/Order");

route.get("/", Customer, OrderController.getAllOrder);
route.post("/", Customer, OrderController.placeOrder);
route.get("/:id", Customer, OrderController.getSingleOrder);
route.put("/:id", Customer, OrderController.updateOrder);
route.delete("/:id", Customer, OrderController.deleteOrder);
route.post("/bkashPaymentPlace", Customer, OrderController.placeBkashPayment);
route.post(
  "/bkashPaymentExecute",
  Customer,
  OrderController.executeBkashPayment
);
route.post("/successSSLPayment", OrderController.successSSLPayment);
route.post("/failSSLPayment", OrderController.failSSLPayment);
route.post("/cancelSSLPayment", OrderController.cancelSSLPayment);
route.post("/notificationSSLPayment", OrderController.notificationSSLPayment);

module.exports = route;
