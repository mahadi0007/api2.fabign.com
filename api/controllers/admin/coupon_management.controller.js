const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Coupon = require("../../../models/coupon.model");

// Index of Measurement
const Index = async (req, res, next) => {
  try {
    let page = +req.query.page;
    let limit = +req.query.limit;
    const total = await Coupon.countDocuments({});
    const coupon = await Coupon.find({})
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("products", "name")
      .populate("created_by", "name")
      .lean();

    return coupon
      ? success(res, "Coupon fetched", {
          page: page,
          limit: limit,
          total: total,
          coupon,
        })
      : notFound(res, "No content found", {
          page: page,
          limit: limit,
          total: total,
          coupon: [],
        });
  } catch (error) {
    if (error) next(error);
  }
};

// Store an item
const Store = async (req, res, next) => {
  const created_by = req.user.id;
  let newCoupon = new Coupon({
    created_by,
    ...req.body,
  });
  newCoupon = await newCoupon.save();

  res.status(201).json({
    status: true,
    result: newCoupon,
    message: "Successfully Coupon created.",
  });
};

// Show specific item
const Show = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.params.id,
    })
      .populate("products", "name")
      .lean();
    return coupon
      ? success(res, "Coupon Found", coupon)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, {});
  }
};

// Update specific item
const Update = async (req, res) => {
  try {
    const { id } = req.user;
    let { ...updateObj } = req.body;
    updateObj["updatedBy"] = id;

    await Coupon.updateOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        $set: updateObj,
      }
    );
    const coupon = await Coupon.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    })
      .populate("products", "name")
      .lean();
    return success(res, "Successfully Updated Coupon", coupon);
  } catch (error) {
    return failure(res, error.message, error);
  }
};

// Delete specific item
const Delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    /* Check coupon available or not */
    const is_available = await Coupon.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "Coupon not available.",
      });
    }

    /* Delete measurement from database */
    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Successfully deleted.",
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  Index,
  Store,
  Show,
  Update,
  Delete,
};
