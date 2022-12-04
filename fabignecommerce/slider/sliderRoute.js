const sliderController = require("./sliderController");
const route = require("express").Router();

route.get("/all/", sliderController.getAllSlider);

module.exports = route;
