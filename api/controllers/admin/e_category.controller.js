const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Category = require("../../../fabignecommerce/models/product/category");
const Helper = require("../../../fabignecommerce/common/helper/index");

const Index = async (req, res, next) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let total = await Category.countDocuments({ isActive: true });

    let category = await Category.find({})
      .sort({ indexId: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate("products")
      .exec();
    return category
      ? success(res, "Category Found", {
          total: total,
          page: page,
          limit: limit,
          category,
        })
      : notFound(res, "No content found", {
          total: total,
          page: page,
          limit: limit,
          category: [],
        });
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Store = async (req, res, next) => {
  try {
    const file = req.files;
    const isExist = await Category.countDocuments({ name: req.body.name });
    if (isExist)
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Category already exist",
      });
    let category = new Category({
      ...req.body,
    });
    let icon =
      file && file.icon
        ? await Helper.FileUpload(
            file.icon,
            "./uploads/category/icon/",
            "icon" + category._id
          )
        : null;
    const uploadFile = await Helper.FileUpload(
      file.banner,
      "./uploads/category/banner/",
      category._id
    );
    category.id = category._id;
    category.banner = uploadFile;
    icon ? (category.icon = icon) : null;
    category = await category.save();
    return success(res, "Category Created", category);
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Show = async (req, res, next) => {
  try {
    let category = await Category.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    })
      .populate("products")
      .exec();
    return category
      ? success(res, "Category Found", category)
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
            "./uploads/category/banner/",
            req.params.id
          )
        : null;
    let icon =
      file && file.icon
        ? await Helper.FileUpload(
            file.icon,
            "./uploads/category/icon/",
            "icon" + req.params.id
          )
        : null;
    let { product, addProduct, removeProduct, ...body } = req.body;
    icon ? (body.icon = icon) : null;
    let updatedObj = {},
      pushObj = addProduct ? { products: product } : null,
      pullObj = removeProduct ? { products: product } : null,
      setObj = body ? { ...body } : null;

    uploadFile ? (setObj["banner"] = uploadFile) : null;
    pushObj ? (updatedObj["$push"] = pushObj) : null;
    pullObj ? (updatedObj["$pull"] = pullObj) : null;
    setObj ? (updatedObj["$set"] = setObj) : null;

    let modified = await Category.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      updatedObj
    );
    const category = modified.matchedCount
      ? await Category.findOne({
          _id: mongoose.Types.ObjectId(req.params.id),
        }).lean()
      : {};
    return modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Successfull Updated Category", category)
        : notModified(res, "Not modified", modified)
      : notFound(res, "No content found", {});
  } catch (error) {
    console.log(error);
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const deleted = await Category.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
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
