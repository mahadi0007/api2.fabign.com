const route = require("express").Router();
const DeliveryChargeController = require("../controller/deliveryChargeController");
route.get("/calculate/", DeliveryChargeController.calculateDeliveryCharge);
route.get("/zones", DeliveryChargeController.getZone);
module.exports = route;
