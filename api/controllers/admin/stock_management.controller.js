const mongoose = require("mongoose");
const {
  success,
  failure,
  notModified,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Product = require("../../../fabignecommerce/models/product/product");
const StockHistory = require("../../../fabignecommerce/models/product/stockHistory");

const Update = async (req, res) => {
  try {
    let { ...updateObj } = req.body;
    const created_by = req.user.id;
    console.log("updateObj");
    console.log(updateObj);
    console.log(updateObj.length);

    // updateObj["updatedBy"] = id;
    if (typeof updateObj === "object") {
      console.log("object");
      console.log(updateObj);
      for (let i = 0; i < Object.keys(updateObj).length; i++) {
        console.log(updateObj[i].variation);
        if (updateObj[i].stockAmount) {
          console.log("if update " + i);
          console.log(updateObj[i]);
          const newStockHistory = new StockHistory({
            ...updateObj[i],
            product: updateObj[i].id,
            created_by,
          });
          await newStockHistory.save();
          await Product.updateOne(
            {
              _id: mongoose.Types.ObjectId(updateObj[i].id),
            },
            {
              $set: { stockAmount: updateObj[i].stockAmount },
            }
          );
          await Product.updateOne(
            {
              _id: mongoose.Types.ObjectId(updateObj[i].id),
            },
            { $push: { stockHistory: newStockHistory._id } }
          );
        }
        if (updateObj[i].variation) {
          for (let j = 0; j < updateObj[i].variation.length; j++) {
            // console.log("j: " + j);
            // console.log(updateObj[i].variation[j]);
            if (updateObj[i].variation[j].stockAmount) {
              console.log("if variation update " + j);
              console.log(updateObj[i].variation[j]);
              console.log(updateObj[i].id);
              const newStockHistory = new StockHistory({
                ...updateObj[i].variation[j],
                variationId: updateObj[i].variation[j].id,
                product: updateObj[i].id,
                created_by,
              });
              await newStockHistory.save();
              await Product.updateOne(
                {
                  _id: mongoose.Types.ObjectId(updateObj[i].id),
                  "variation.values._id": mongoose.Types.ObjectId(
                    updateObj[i].variation[j].id
                  ),
                },
                {
                  $set: {
                    "variation.values.$.stockAmount":
                      updateObj[i].variation[j].stockAmount,
                  },
                }
              );
              await Product.updateOne(
                {
                  _id: mongoose.Types.ObjectId(updateObj[i].id),
                  "variation.values._id": mongoose.Types.ObjectId(
                    updateObj[i].variation[j].id
                  ),
                },
                { $push: { stockHistory: newStockHistory._id } }
              );
            }
          }
        }
      }
    }
    // const modified = await Product.updateOne(
    //   {
    //     _id: mongoose.Types.ObjectId(req.params.id),
    //   },
    //   {
    //     $set: updateObj,
    //   }
    // );

    // const product = await Product.findOne({
    //   _id: mongoose.Types.ObjectId(req.params.id),
    // })
    //   .populate({
    //     path: "category",
    //     select: "name _id",
    //   })
    //   .populate({
    //     path: "brand",
    //     select: "title _id",
    //   })
    //   .lean();
    return success(res, "Successfull Updated Stock", {});

    // return modified.matchedCount
    //   ? modified.modifiedCount
    //     ? success(res, "Successfull Updated Product", {})
    //     : notModified(res, "Not modified", {})
    //   : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

module.exports = {
  Update,
};
