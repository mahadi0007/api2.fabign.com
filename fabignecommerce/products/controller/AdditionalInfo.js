const {
  failure,
  success,
  notModified,
  notFound,
} = require("../../common/helper/responseStatus");
const mongoose = require("mongoose");
const Helper = require("../../common/helper/index");
const AdditionalInfo = require("../../models/product/AdditionalInfo");
const Product = require("../../models/product/product");

// FAQ Controller
class AdditionalinfoController {
  // for adding faq
  async addAdditionalInfo(req, res) {
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
  }

  // for editing faq
  async editAdditionInfo(req, res) {
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
  }

  // delete faq
  async deleteAdditionalInfo(req, res) {
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
  }

  // get all faq
  async getAllAdditionalInfo(req, res) {
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
  }

  // get product wise faq
  async getProductWise(req, res) {
    try {
      const info = await AdditionalInfo.findOne({
        product: mongoose.Types.ObjectId(req.params.id),
      }).populate({
        path: "product",
        select: "name _id",
      });
      return info
        ? success(res, "Additional info Fetched", {
            info,
          })
        : notFound(res, "No content Found", {
            info: [],
          });
    } catch (error) {
      return failure(res, error.message, {});
    }
  }

  // get single
  async getSingleAdditionalInfo(req, res) {
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
  }

  // producct with FAQ
  async getProductwithAdditionalInfo(req, res) {
    try {
      // await Product.updateMany({
      //     $set: { additionalInfo: false }
      // })
      const productWithoutFAQ = await Product.find(
        { additionalInfo: false },
        { name: 1 }
      );

      return productWithoutFAQ
        ? success(
            res,
            "Product Fetch that don't have any faq",
            productWithoutFAQ
          )
        : failure("No Product exist");
    } catch (error) {
      return failure("No Product exist");
    }
  }
}

module.exports = new AdditionalinfoController();
