const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const FAQ = require("../../../fabignecommerce/models/product/FAQ");
const Product = require("../../../fabignecommerce/models/product/product");

const Index = async (req, res, next) => {
  try {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 10;
    const total = await FAQ.countDocuments({});
    const faq = await FAQ.find({})
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "product",
        select: "name _id",
      });
    return faq
      ? success(res, "FAQ Fetched", {
          page: page,
          limit: limit,
          total: total,
          faq,
        })
      : notFound(res, "No content Found", {
          page: page,
          limit: limit,
          total: total,
          faq: [],
        });
  } catch (error) {
    return failure(res, error.message, {});
  }
};

const ProductWithFaq = async (req, res, next) => {
  try {
    const productWithoutFAQ = await Product.find({ faq: false }, { name: 1 });

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
    const isExist = await FAQ.findOne({
      product: mongoose.Types.ObjectId(product),
    });
    if (isExist) {
      return failure(res, "FAQ is already available.", {});
    } else {
      let faq = await new FAQ(req.body);
      faq = await faq.save();
      await Product.updateOne(
        { _id: mongoose.Types.ObjectId(product) },
        {
          $set: { faq: true },
        }
      );
      return faq
        ? success(res, "FAQ Created", faq)
        : failure(res, "Failed to create faq", {});
    }
  } catch (error) {
    failure(res, "Failed to create FAQ", {});
  }
};

const Show = async (req, res, next) => {
  try {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 10;

    const faq = await FAQ.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).populate({
      path: "product",
      select: "name _id",
    });

    return faq
      ? success(res, "FAQ Fetched", {
          faq,
        })
      : notFound(res, "No content Found", {
          faq: {},
        });
  } catch (error) {
    return failure(res, error.message, {});
  }
};

const Update = async (req, res) => {
  try {
    let id = req.params.id;
    const modifyFaq = await FAQ.updateOne(
      { _id: mongoose.Types.ObjectId(id) },
      {
        $set: req.body,
      }
    );

    return modifyFaq
      ? success(res, "FAQ successfully modified", modifyFaq)
      : notModified(res, "FAQ Can't be updated");
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const faq = await FAQ.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    await Product.updateOne(
      { _id: mongoose.Types.ObjectId(faq.product) },
      {
        $set: { faq: false },
      }
    );

    let deleted = await FAQ.deleteOne({
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
  ProductWithFaq,
  Store,
  Show,
  Update,
  Delete,
};
