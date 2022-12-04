const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Brand = require("../../../fabignecommerce/models/product/Brand");
const Product = require("../../../fabignecommerce/models/product/product");
const { FileUpload } = require("../../../fabignecommerce/common/helper");

const Index = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10,
      page = req.query.page || 1,
      total = await Brand.countDocuments({});
    const brand = await Brand.find({})
      .sort({ _id: -1 })
      .skip(limit * (page - 1))
      .lean();
    return brand
      ? success(res, "Fetched brand", {
          total: total,
          page: page,
          limit: limit,
          brand: brand,
        })
      : notFound(res, "No content found", {
          total: total,
          page: page,
          limit: limit,
          brand: brand || [],
        });
  } catch (error) {
    failure(res, "Failed to fetch brand", {});
  }
};

const Store = async (req, res, next) => {
  try {
    let file = req.files;
    let { title, productCount } = req.body;
    let newBrand = {};
    title ? (newBrand["title"] = title) : null;
    productCount ? (newBrand["productCount"] = productCount) : null;
    let brand = new Brand(newBrand);
    let uploadFile = file
      ? await FileUpload(file.logo, "./uploads/brand/logo/", brand._id)
      : "";
    brand.logo = uploadFile;
    brand = await brand.save();
    return brand
      ? success(res, "Brand created", brand)
      : failure(res, "Failed to create", {});
  } catch (error) {
    console.log(error);
    failure(res, "Failed to create brand", {});
  }
};

const Show = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    const products = brand
      ? await Product.find({
          brand: mongoose.Types.ObjectId(req.params.id),
        }).lean()
      : [];
    brand ? (brand["products"] = products) : null;
    return brand
      ? success(res, "Brand Fatched", brand)
      : notFound(res, "No content found", {});
  } catch (error) {
    failure(res, "Failed to find brand", {});
  }
};

const Update = async (req, res) => {
  try {
    let file = req.files;
    let { title, productCount } = req.body;
    let updateObj = {};
    title ? (updateObj["title"] = title) : null;
    let logo = file
      ? await FileUpload(file.logo, "./uploads/brand/logo/", req.params.id)
      : null;
    logo ? (updateObj["logo"] = logo) : null;

    productCount ? (updateObj["productCount"] = productCount) : null;

    const modified = await Brand.updateOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        $set: updateObj,
      }
    );
    const brand = await Brand.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    return modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Successfull Updated Brand", brand)
        : notModified(res, "Not modified", {})
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    let deleted = await Brand.deleteOne({
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
