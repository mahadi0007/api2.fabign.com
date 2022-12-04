const mongoose = require("mongoose");
const {
  success,
  failure,
  notModified,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const StockReason = require("../../../fabignecommerce/models/product/stockReason");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");
const validator = require("../../validators/stock_reason.validator");

// List of items
const Index = async (req, res, next) => {
  try {
    const { limit, page } = PaginateQueryParams(req.query);
    const totalItems = await StockReason.countDocuments({
      is_deleted: false,
    }).exec();
    const results = await StockReason.find({})
      .populate("product")
      .sort({ _id: -1 })
      .skip(parseInt(page) * parseInt(limit) - parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    res.status(200).json({
      status: true,
      data: results,
      pagination: Paginate({ page, limit, totalItems }),
    });
  } catch (error) {
    console.log(error);
    if (error) next(error);
  }
};

// Store an item
const Store = async (req, res, next) => {
  try {
    const created_by = req.user.id;
    const { reason } = req.body;

    // Validate check
    const validate = await validator.Store(req.body);
    if (!validate.isValid) {
      return res.status(422).json({
        status: false,
        message: validate.error,
      });
    }

    // Check exist
    const isExist = await StockReason.findOne({
      reason,
    });
    if (isExist) {
      return res.status(409).json({
        status: false,
        message: `This Stock Reason already exist.`,
      });
    }

    const newStockReason = new StockReason({
      reason,
      created_by,
    });

    await newStockReason.save();

    res.status(201).json({
      status: true,
      result: newStockReason,
      message: "Successfully stock reason created.",
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  Index,
  Store,
};
