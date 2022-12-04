const mongoose = require("mongoose");
const {
  success,
  failure,
  notModified,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const StockHistory = require("../../../fabignecommerce/models/product/stockHistory");
const Role = require("../../../models/role.model");
const Admin = require("../../../models/admin.model");

// List of roles items
const RoleIndex = async (req, res, next) => {
  try {
    const roles = await Role.find({
      rights: { $in: ["stock-management", "all"] },
    })
      .sort({ role: 1 })
      .exec();

    let admins;

    if (roles && roles.length) {
      const id = roles.map(function (value) {
        return value._id;
      });
      admins = await Admin.find({
        role: { $in: id },
      }).exec();
    }

    res.status(200).json({
      status: true,
      data: admins,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// List of items
const Index = async (req, res, next) => {
  try {
    const results = await StockHistory.find({ created_by: req.params.id })
      .populate("product")
      .populate("reason")
      .exec();

    res.status(200).json({
      status: true,
      data: results,
    });
  } catch (error) {
    console.log(error);
    if (error) next(error);
  }
};

module.exports = {
  RoleIndex,
  Index,
};
