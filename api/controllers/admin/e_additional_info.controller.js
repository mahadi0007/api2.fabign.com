const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const AdditionalInfo = require("../../../fabignecommerce/models/product/AdditionalInfo");
const Product = require("../../../fabignecommerce/models/product/product");

const Index = async (req, res, next) => {
  try {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 10;
    const total = await AdditionalInfo.countDocuments({});
    const info = await AdditionalInfo.find({})
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "product",
        select: "name _id",
      });
    return info
      ? success(res, "Additional info Fetched", {
          page: page,
          limit: limit,
          total: total,
          info,
        })
      : notFound(res, "No content Found", {
          page: page,
          limit: limit,
          total: total,
          info: [],
        });
  } catch (error) {
    return failure(res, error.message, {});
  }
};

const ProductWithAdditionalInfo = async (req, res, next) => {
  try {
    // await Product.updateMany({
    //     $set: { additionalInfo: false }
    // })
    const productWithoutFAQ = await Product.find(
      { additionalInfo: false },
      { name: 1 }
    );

    return productWithoutFAQ
      ? success(res, "Product Fetch that don't have any faq", productWithoutFAQ)
      : failure("No Product exist");
  } catch (error) {
    return failure("No Product exist");
  }
};

const Store = async (req, res, next) => {
  try {
    const { product } = req.body;
    const isExist = await AdditionalInfo.findOne({
      product: mongoose.Types.ObjectId(product),
    });
    if (isExist) {
      return failure(res, "Additional info is already available.", {});
    } else {
      let info = await new AdditionalInfo(req.body);
      info = await info.save();
      await Product.updateOne(
        { _id: mongoose.Types.ObjectId(product) },
        {
          $set: { additionalInfo: true },
        }
      );
      return info
        ? success(res, "Additional Info Created", info)
        : failure(res, "Failed to create additional info", {});
    }
  } catch (error) {
    failure(res, "Failed to create additional info", {});
  }
};

const Show = async (req, res, next) => {
  try {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 10;

    const info = await AdditionalInfo.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).populate({
      path: "product",
      select: "name _id",
    });

    return info
      ? success(res, "AdditionalInfo Fetched", {
          info,
        })
      : notFound(res, "No content Found", {
          info: {},
        });
  } catch (error) {
    return failure(res, error.message, {});
  }
};

const Update = async (req, res) => {
  try {
    let id = req.params.id;
    const modifyInfo = await AdditionalInfo.updateOne(
      { _id: mongoose.Types.ObjectId(id) },
      {
        $set: req.body,
      }
    );

    return modifyInfo
      ? success(res, "Additional Info successfully modified", modifyInfo)
      : notModified(res, "Additional Info Can't be updated");
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const info = await AdditionalInfo.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    await Product.updateOne(
      { _id: mongoose.Types.ObjectId(info.product) },
      {
        $set: { additionalInfo: false },
      }
    );

    let deleted = await AdditionalInfo.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    return deleted
      ? success(res, "Successfully Deleted", deleted)
      : notModified(res, "Not deleted", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

module.exports = {
  Index,
  ProductWithAdditionalInfo,
  Store,
  Show,
  Update,
  Delete,
};
