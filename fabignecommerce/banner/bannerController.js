const {
  failure,
  notFound,
  success,
} = require("../common/helper/responseStatus");
const Banner = require("../models/Banner/Banner");

class BannerController {
  async getAllBanner(req, res) {
    try {
      let page = req.query.page || 1,
        limit = req.query.limit || 10;
      let banner = await Banner.find({})
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return banner
        ? success(res, "Banner Fetched", banner)
        : notFound(res, "No content found", {});
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
}

module.exports = new BannerController();
