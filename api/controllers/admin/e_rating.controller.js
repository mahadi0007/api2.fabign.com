const mongoose = require("mongoose");
const {
  success,
  failure,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Rating = require("../../../fabignecommerce/models/product/rating");
const Product = require("../../../fabignecommerce/models/product/product");

const Index = async (req, res, next) => {
  try {
    let { page, limit } = req.query;
    page = +page || 1;
    limit = +limit || 10;
    let total = await Rating.countDocuments();
    const rating = await Rating.find({})
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
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
};

// Show specific item
const Show = async (req, res, next) => {
  try {
    const rating = await Rating.findOne({
      _id: req.params.id,
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
    return rating
      ? success(res, "Rating Found", rating)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, {});
  }
};

const Update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const updatedRating = await Rating.findOneAndUpdate(
      { _id: id },
      { $set: { approved: approve } }
    );
    let productRating = await Rating.find({
      product: mongoose.Types.ObjectId(updatedRating.product),
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
    if (totalRating == 0) {
      await Product.updateOne(
        { _id: mongoose.Types.ObjectId(updatedRating.product) },
        {
          $set: {
            avgRating: 0,
            ratingCount: 0,
          },
        }
      );
    } else {
      await Product.updateOne(
        { _id: mongoose.Types.ObjectId(updatedRating.product) },
        {
          $set: {
            avgRating: +(totalRating / ratingCount).toFixed(1),
            ratingCount,
          },
        }
      );
    }
    return updatedRating
      ? success(res, "Rating Approved", {
          approvedRating: updatedRating,
        })
      : notFound(res, "No Rating Found");
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const { id, productId } = req.params;
    await Rating.deleteOne({ _id: mongoose.Types.ObjectId(id) });
    await Product.updateOne(
      { ratingReview: mongoose.Types.ObjectId(id) },
      {
        $pull: {
          ratingReview: id,
        },
      }
    );
    let productRating = await Rating.find({
      product: productId,
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
        { _id: mongoose.Types.ObjectId(productId) },
        {
          $set: {
            avgRating: 0,
            ratingCount: 0,
          },
        }
      );
    } else {
      await Product.updateOne(
        { _id: mongoose.Types.ObjectId(productId) },
        {
          $set: {
            avgRating: +(totalRating / ratingCount).toFixed(1),
            ratingCount,
          },
        }
      );
    }

    return success(res, "Rating Removed ", {
      ratingReview: productRating,
      avgRating: +(totalRating / ratingCount).toFixed(1),
    });
  } catch (error) {
    return failure(res, error.message, error.stack);
  }
};

module.exports = {
  Index,
  Show,
  Update,
  Delete,
};
