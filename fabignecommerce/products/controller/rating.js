const { failure, success } = require("../../common/helper/responseStatus");

const Rating = require("../../models/product/rating");
const Product = require("../../models/product/product");
const mongoose = require("mongoose");
const Helper = require("../../common/helper/index");
class RatingController {
  async addNewRating(req, res) {
    try {
      const files = req.files;
      const user = req.user.id;
      const { product, orderId, ...rating } = req.body;
      const totalItems = await Rating.countDocuments({
        product: mongoose.Types.ObjectId(product),
        orderId: mongoose.Types.ObjectId(orderId),
      }).exec();
      if (totalItems > 0) {
        return failure(
          res,
          "You have already given review of this product for this order.",
          {}
        );
      }
      let newRating = new Rating({
        product: mongoose.Types.ObjectId(product),
        orderId: mongoose.Types.ObjectId(orderId),
        user: user,
        ...rating,
      });
      let uploadFile = [];
      if (files) {
        if (Array.isArray(files.images)) {
          for (let i = 0; i < files.images.length; i++) {
            uploadFile.push(
              await Helper.FileUpload(
                files.images[i],
                "./uploads/product/review/",
                newRating._id + "_" + i
              )
            );
          }
        } else {
          uploadFile.push(
            await Helper.FileUpload(
              files.images,
              "./uploads/product/review/",
              newRating._id + "_" + 0
            )
          );
        }
      }
      newRating.images = uploadFile;
      newRating = await newRating.save();

      let productRating = await Rating.find({
        product: mongoose.Types.ObjectId(product),
        approved: true,
      })
        .populate({
          path: "user",
          select: "name _id",
        })
        .populate({
          path: "reply",
          populate: {
            path: "user",
            select: "name _id",
          },
        })
        .lean();
      let ratingCount = 0,
        totalRating = 0;
      productRating.map((r) => {
        ratingCount++;
        totalRating += r.rating;
      });
      if (totalRating === 0) {
        await Product.updateOne(
          { _id: mongoose.Types.ObjectId(product) },
          {
            $set: {
              avgRating: 0,
              ratingCount: 0,
            },
            $push: {
              ratingReview: newRating._id,
            },
          }
        );
        return success(res, "Rating added ", {
          ratingReview: productRating,
          avgRating: 0,
        });
      } else {
        await Product.updateOne(
          { _id: mongoose.Types.ObjectId(product) },
          {
            $set: {
              avgRating: +(totalRating / ratingCount).toFixed(1),
              ratingCount,
            },
            $push: {
              ratingReview: newRating._id,
            },
          }
        );
        return success(res, "Rating added ", {
          ratingReview: productRating,
          avgRating: +(totalRating / ratingCount).toFixed(1),
        });
      }
    } catch (error) {
      console.log(error);
      return failure(res, error.message, error);
    }
  }
  async getAllRating(req, res) {
    try {
      let { page, limit } = req.query;
      page = +page || 1;
      limit = +limit || 10;
      let total = await Rating.countDocuments();
      const rating = await Rating.find({})
        .populate({
          path: "user",
          select: "name _id",
        })
        .populate({
          path: "reply",
          populate: {
            path: "user",
            select: "name _id",
          },
        });
      console.log(rating);
      return rating && rating.length > 0
        ? success(res, "Rating found", {
            page: page,
            limit: limit,
            total: total,
            ratingReview: rating,
          })
        : notFound(res, "No Rating found", {
            page: page,
            limit: limit,
            total: total,
            ratingReview: rating,
          });
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
  async approveRating(req, res) {
    try {
      const { id, approve } = req.body;
      const find = Rating.find({ _id: mongoose.Types.ObjectId(id) });
      const updatedRating = await Rating.findOneAndUpdate(
        { _id: id },
        { $set: { approved: approve } }
      );
      return updatedRating
        ? success(res, "Rating Approved", {
            approvedRating: updatedRating,
          })
        : notFound(res, "No Rating Found");
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
  async getRating(req, res) {
    try {
      let { page, limit, product } = req.query;
      page = +page || 1;
      limit = +limit || 10;
      let total = await Rating.countDocuments({
        product: mongoose.Types.ObjectId(product),
      });
      const rating = await Rating.find({
        product: mongoose.Types.ObjectId(product),
        approved: true,
      })
        .populate({
          path: "user",
          select: "name _id",
        })
        .populate({
          path: "reply",
          populate: {
            path: "user",
            select: "name _id",
          },
        });
      return rating && rating.length > 0
        ? success(res, "Rating found", {
            page: page,
            limit: limit,
            total: total,
            ratingReview: rating,
          })
        : notFound(res, "No Rating found", {
            page: page,
            limit: limit,
            total: total,
            ratingReview: rating,
          });
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
}

module.exports = new RatingController();
