const bannerController = require("./bannerController");
const route = require("express").Router();

route.get("/all", bannerController.getAllBanner);

module.exports = route;
