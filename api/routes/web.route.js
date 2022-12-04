const express = require("express");
const WebRouter = express.Router();
// const { Customer } = require("../../fabignecommerce/common/middleware/Permission");
const TopbarController = require("../controllers/web/topbar.controller");
const TopbarButtonController = require("../controllers/web/topbar_button.controller");
const Pathao = require("../controllers/web/pathao.controller");

// Topbar routes
WebRouter.get("/topbar", TopbarController.Index);

// Topbar button routes
WebRouter.get("/topbar-button", TopbarButtonController.Index);

// Pathao
WebRouter.get("/pathao/getCities", Pathao.GetCities);
WebRouter.get("/pathao/getZones/:city", Pathao.GetZones);
WebRouter.get("/pathao/getAreas/:zone", Pathao.GetAreas);

module.exports = { WebRouter };
