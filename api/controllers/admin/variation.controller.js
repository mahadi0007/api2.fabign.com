const {
  success,
  notFound,
  notModified,
  failure,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Variation = require("../../../fabignecommerce/models/product/Variation");
const mongoose = require("mongoose");
const validator = require("validatorjs");
const ERROR_MESSAGE = require("../../../fabignecommerce/common/helper/errorMessage");

const Index = async (req, res, next) => {
  try {
    let page = +req.query.page || 1;
    let limit = +req.query.limit || 10;
    const total = await Variation.countDocuments({});
    const variation = await Variation.find({})
      .sort({ _id: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .lean();
    return variation
      ? success(res, "Fetched variation", {
          total: total,
          page: page,
          limit: limit,
          variation: variation,
        })
      : notFound(res, "No content found", {
          total: total,
          page: page,
          limit: limit,
          variation: variation || [],
        });
  } catch (error) {
    console.log("error");
    console.log(error);
    failure(res, "Failed to fetch variation", {});
  }
};

const Store = async (req, res, next) => {
  try {
    let validation = new validator(req.body, {
      name: "required",
      values: "array|required",
    });
    if (validation.fails()) {
      return failure(
        res,
        ERROR_MESSAGE.HTTP_NOT_ACCEPTABLE,
        validation.errors.errors
      );
    }
    let variation = new Variation(req.body);
    variation = await variation.save();
    return variation
      ? success(res, "Variation created", variation)
      : failure(res, "Failed to create", {});
  } catch (error) {
    failure(res, "Failed to create variation", {});
  }
};

const Show = async (req, res, next) => {
  try {
    const variation = await Variation.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    return variation
      ? success(res, "Variation Fetched", variation)
      : notFound(res, "No content found", {});
  } catch (error) {
    failure(res, "Failed to find variation", {});
  }
};

const Update = async (req, res) => {
  try {
    let validation = new validator(req.body, {
      name: "required",
      values: "array|required",
    });
    if (validation.fails()) {
      return failure(
        res,
        ERROR_MESSAGE.HTTP_NOT_ACCEPTABLE,
        validation.errors.errors
      );
    }
    const modified = await Variation.updateOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        $set: req.body,
      }
    );
    const variation = await Variation.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    }).lean();
    return modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Successfully Updated Variation", variation)
        : notModified(res, "Not modified", {})
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    let deleted = await Variation.deleteOne({
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
