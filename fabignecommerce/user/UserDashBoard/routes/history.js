const {Customer} = require("../../../common/middleware/Permission");
const historyController = require("../controller/orderHistory");

const route = require("express").Router();

route.get("/history/", Customer, historyController.getOrderHistoryForUser);
route.get("/summary/", Customer, historyController.dashBoardSummary);
module.exports = route;