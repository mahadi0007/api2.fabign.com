const mongoose = require("mongoose");
const {
  failure,
  notFound,
  success,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const { FileUpload } = require("../../../fabignecommerce/common/helper");
const Banner = require("../../../fabignecommerce/models/Banner/Banner");
const ERROR_LIST = require("../../../fabignecommerce/common/helper/errorList");

const Index = async (req, res, next) => {
  try {
    let banner = await Banner.find({}).sort({ _id: -1 }).lean();
    return banner
      ? success(res, "banner Fetched", banner)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Store = async (req, res, next) => {
  try {
    let file = req.files;
    let banner = new Banner({
      ...req.body,
    });
    let uploadFile = file
      ? await FileUpload(file.banner, "./uploads/banner/", banner._id)
      : "";
    banner.banner = uploadFile;
    banner = await banner.save();
    return banner
      ? res
          .status(ERROR_LIST.HTTP_OK)
          .send(success(res, "Banner added", banner))
      : res.status(ERROR_LIST).send(failure(res, "Failed to create", {}));
  } catch (err) {
    return failure(res, err.message, err);
  }
};

const Show = async (req, res, next) => {
  try {
    const banner = await Banner.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    return banner
      ? success(res, "Banner Fatched", banner)
      : notFound(res, "No content found", {});
  } catch (error) {
    failure(res, "Failed to find brand", {});
  }
};

const Update = async (req, res, next) => {
  try {
    let updateObj = req.body;
    if (req.files) {
      let uploadFile = req.files
        ? await FileUpload(req.files.banner, "./uploads/banner/", req.params.id)
        : null;
      uploadFile ? (updateObj.banner = uploadFile) : null;
    }
    const banner = await Banner.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateObj }
    );

    return banner
      ? success(res, "Successfully Banner updated.", banner)
      : notFound(res, "No content found");
  } catch (err) {
    return failure(res, err.message, err);
  }
};

const Delete = async (req, res) => {
  try {
    const banner = await Banner.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    let deleted = await Banner.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    if (deleted.deletedCount) {
      const filePath = path.join(__dirname, "../../", banner.banner);
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
