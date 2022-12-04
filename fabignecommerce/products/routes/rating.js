const route = require("express").Router();
const { Customer } = require("../../common/middleware/Permission");
const RatingController = require("../controller/rating");

route.post("/rating/add/", Customer, RatingController.addNewRating);
route.get("/rating/get/", RatingController.getRating);
module.exports = route;
