const mongoose = require("mongoose");
const {
  failure,
  notFound,
  notModified,
  success,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const { FileUpload } = require("../../../fabignecommerce/common/helper");
const Slider = require("../../../fabignecommerce/models/Slider/Slider");
const ERROR_LIST = require("../../../fabignecommerce/common/helper/errorList");
const fs = require("fs");
const path = require("path");

const Index = async (req, res, next) => {
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
};

const Store = async (req, res, next) => {
  try {
    let file = req.files;
    let slider = new Slider({
      ...req.body,
    });
    let uploadFile = file
      ? await FileUpload(file.banner, "./uploads/slider/", slider._id)
      : "";
    slider.banner = uploadFile;
    slider = await slider.save();
    return slider
      ? res
          .status(ERROR_LIST.HTTP_OK)
          .send(success(res, "Slider added", slider))
      : res.status(ERROR_LIST).send(failure(res, "Failed to create", {}));
  } catch (error) {
    return res
      .status(ERROR_LIST.HTTP_INTERNAL_SERVER_ERROR)
      .send(failure(res, error.message, error));
  }
};

const Show = async (req, res, next) => {
  try {
    const slider = await Slider.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    return slider
      ? success(res, "Slider Fatched", slider)
      : notFound(res, "No content found", {});
  } catch (error) {
    failure(res, "Failed to find brand", {});
  }
};

const Update = async (req, res) => {
  try {
    let updateObj = req.body;
    if (req.files) {
      let uploadFile = req.files
        ? await FileUpload(req.files.banner, "./uploads/slider/", req.params.id)
        : null;
      uploadFile ? (updateObj.banner = uploadFile) : null;
    }
    const slider = await Slider.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateObj }
    );
    return slider
      ? success(res, "Successfully Updated slider", slider)
      : notFound(res, "No content found");
  } catch (error) {
    console.log("error");
    console.log(error);
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const slider = await Slider.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    let deleted = await Slider.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    if (deleted.deletedCount) {
      const filePath = path.join(__dirname, "../../", slider.banner);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return deleted.deletedCount
      ? success(res, "Successfully deleted", deleted)
      : notModified(res, "Not deleted", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

module.exports = {
  Index,
  Store,
  Show,
  Update,
  Delete,
};
