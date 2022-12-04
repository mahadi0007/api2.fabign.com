const {
  failure,
  notFound,
  success,
} = require("../common/helper/responseStatus");
const Slider = require("../models/Slider/Slider");

class SliderController {
  async getAllSlider(req, res) {
    try {
      let page = req.query.page || 1,
        limit = req.query.limit || 10;
      let slider = await Slider.find({})
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return slider
        ? success(res, "Slider Fatched", slider)
        : notFound(res, "No content found", {});
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
}

module.exports = new SliderController();
