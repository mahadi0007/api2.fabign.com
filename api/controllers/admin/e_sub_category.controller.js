const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const SubCategory = require("../../../fabignecommerce/models/product/subCategory");
const Helper = require("../../../fabignecommerce/common/helper/index");
const fs = require("fs");
const path = require("path");
const validator = require("validatorjs");
const ERROR_MESSAGE = require("../../../fabignecommerce/common/helper/errorMessage");

const Index = async (req, res, next) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let total = await SubCategory.countDocuments({ isActive: true });

    let subcategory = await SubCategory.find({})
      .sort({ indexId: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate("products")
      .populate("category")
      .exec();
    return subcategory
      ? success(res, "Sub Category Found", {
          total: total,
          page: page,
          limit: limit,
          subcategory,
        })
      : notFound(res, "No content found", {
          total: total,
          page: page,
          limit: limit,
          subcategory: [],
        });
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Store = async (req, res, next) => {
  try {
    const file = req.files;
    let validation = new validator(req.body, {
      name: "required",
    });
    if (validation.fails() || !file || !file.icon) {
      validation.errors.errors.icon = ["The file icon is required"];
      return failure(
        res,
        ERROR_MESSAGE.HTTP_NOT_ACCEPTABLE,
        validation.errors.errors
      );
    }
    const isExist = await SubCategory.countDocuments({ name: req.body.name });
    if (isExist)
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Category already exist",
      });
    let subcategory = new SubCategory({
      ...req.body,
    });
    // for icon
    let icon =
      file && file.icon
        ? await Helper.FileUpload(
            file.icon,
            "./uploads/subcategory/icon/",
            "icon" + subcategory._id
          )
        : null;
    // for size guide
    let sizeGuide =
      file && file.sizeGuide
        ? await Helper.FileUpload(
            file.sizeGuide,
            "./uploads/subcategory/sizeGuide/",
            "sizeGuide" + subcategory._id
          )
        : null;
    subcategory.id = subcategory._id;
    sizeGuide ? (subcategory.sizeGuide = sizeGuide) : null;
    icon ? (subcategory.icon = icon) : null;
    subcategory = await subcategory.save();
    return success(res, "Sub Category Created", subcategory);
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Show = async (req, res, next) => {
  try {
    let category = await SubCategory.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    })
      .populate("products")
      .populate("category")
      .exec();
    return category
      ? success(res, "Sub Category Found", category)
      : notFound(res, "No Content Found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Update = async (req, res) => {
  try {
    const file = req.files;
    const uploadFile =
      file && file.banner
        ? await Helper.FileUpload(
            file.banner,
            "./uploads/subcategory/banner/",
            req.params.id
          )
        : null;
    let icon =
      file && file.icon
        ? await Helper.FileUpload(
            file.icon,
            "./uploads/subcategory/icon/",
            "icon" + req.params.id
          )
        : null;
    let sizeGuide =
      file && file.sizeGuide
        ? await Helper.FileUpload(
            file.sizeGuide,
            "./uploads/subcategory/sizeGuide/",
            "sizeGuide" + req.params.id
          )
        : null;
    let { product, addProduct, removeProduct, ...body } = req.body;
    icon ? (body.icon = icon) : null;
    sizeGuide ? (body.sizeGuide = sizeGuide) : null;
    let updatedObj = {},
      pushObj = addProduct ? { products: product } : null,
      pullObj = removeProduct ? { products: product } : null,
      setObj = body ? { ...body } : null;

    uploadFile ? (setObj["banner"] = uploadFile) : null;
    pushObj ? (updatedObj["$push"] = pushObj) : null;
    pullObj ? (updatedObj["$pull"] = pullObj) : null;
    setObj ? (updatedObj["$set"] = setObj) : null;

    let modified = await SubCategory.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      updatedObj
    );
    const category = modified.matchedCount
      ? await SubCategory.findOne({
          _id: mongoose.Types.ObjectId(req.params.id),
        }).lean()
      : {};
    return modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Successfully Updated Sub Category", category)
        : notModified(res, "Not modified", modified)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const subcat = await SubCategory.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    const deleted = await SubCategory.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    if (deleted.deletedCount) {
      const filePath = path.join(__dirname, "../../", subcat.banner);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const iconPath = path.join(__dirname, "../../", subcat.icon);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
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
