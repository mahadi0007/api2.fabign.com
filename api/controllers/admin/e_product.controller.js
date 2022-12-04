const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const { Readable } = require("stream");
const {
  success,
  failure,
  notModified,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const Product = require("../../../fabignecommerce/models/product/product");
const Variation = require("../../../fabignecommerce/models/product/Variation");
const Category = require("../../../fabignecommerce/models/product/category");
const Brand = require("../../../fabignecommerce/models/product/Brand");
const Helper = require("../../../fabignecommerce/common/helper/index");

const Index = async (req, res, next) => {
  try {
    let page = +req.query.page;
    let limit = +req.query.limit;
    let searchText = req.query.searchText;
    const total = await Product.countDocuments({});
    let product;
    if ("searchText" in req.query) {
      if (searchText.length > 0) {
        product = await Product.find({
          $or: [
            { name: new RegExp(searchText, "i") },
            { sku: new RegExp(searchText, "i") },
          ],
        })
          .sort({ _id: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate({
            path: "category",
            select: "name _id",
          })
          .populate({
            path: "brand",
            select: "title _id",
          })
          .populate("subcategory")
          .populate("variation.parents")
          .lean();
      } else {
        product = [];
      }
    } else {
      product = await Product.find({})
        .sort({ _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "brand",
          select: "title _id",
        })
        .populate("subcategory")
        .populate("variation.parents")
        .lean();
    }

    return product
      ? success(res, "Product fetched", {
          page: page,
          limit: limit,
          total: total,
          product,
        })
      : notFound(res, "No content found", {
          page: page,
          limit: limit,
          total: total,
          product: [],
        });
  } catch (error) {
    return failure(res, error.message, {});
  }
};

const Store = async (req, res, next) => {
  try {
    const files = req.files;
    if (files?.productList) {
      const products = [];
      const variation = [];
      const variationIds = [];
      const workbook = new ExcelJS.Workbook();
      var stream = new Readable();
      stream.push(files.productList.data);
      stream.push(null);
      const worksheet = await workbook.csv.read(stream);
      let columns = [];
      worksheet.eachRow(async (row, rowNumber) => {
        if (rowNumber == 1) {
          columns = row.values;
        } else {
          if (row.values[columns.indexOf("Type")] == "simple") {
            const existProduct = await Product.findOne({
              name: row.values[columns.indexOf("Name")],
            });
            if (!existProduct) {
              const category = await Category.findOne({
                name: row.values[columns.indexOf("Categories")],
              });
              const productId = await Helper.uniqueId("P");
              const base64 = await Helper.getBase64FromUrl(
                row.values[columns.indexOf("Images")]
              );
              const image = await Helper.FileUploadOfProductBaseData(
                base64,
                `./uploads/product`,
                productId + "_" + Date.now() + "T",
                row.values[columns.indexOf("Images")].split(".").pop()
              );
              let newProduct = new Product({
                name: row.values[columns.indexOf("Name")],
                sku: row.values[columns.indexOf("SKU")],
                shortDescription:
                  row.values[columns.indexOf("Short description")],
                description: row.values[columns.indexOf("Description")],
                manageStock:
                  row.values[columns.indexOf("In stock?")] == 1 ? true : false,
                sellingPrice: row.values[columns.indexOf("Sale price")],
                regularPrice: row.values[columns.indexOf("Regular price")],
                category: category._id,
                productId,
                featuredImage: {
                  small: image,
                  large: image,
                },
                createdBy: req.user.id,
              });
              await newProduct.save();
            }
          } else if (row.values[columns.indexOf("Type")] == "variable") {
            products.push({
              name: row.values[columns.indexOf("Name")],
              sku: row.values[columns.indexOf("SKU")],
              shortDescription:
                row.values[columns.indexOf("Short description")],
              description: row.values[columns.indexOf("Description")],
              image: row.values[columns.indexOf("Images")],
              createdBy: req.user.id,
            });
            if (variation.length == 0) {
              variation.push([
                row.values[columns.indexOf("Attribute 1 value(s)")],
              ]);
            } else if (
              !variation.filter(
                (element) =>
                  element[0] ===
                  row.values[columns.indexOf("Attribute 1 value(s)")]
              )
            ) {
              variation.push([
                row.values[columns.indexOf("Attribute 1 value(s)")],
              ]);
            }
            products.find(
              (el) => el.sku === row.values[columns.indexOf("SKU")]
            ).variation = {
              parents: [
                variation.findIndex(
                  (element) =>
                    element[0] ==
                    row.values[columns.indexOf("Attribute 1 value(s)")]
                ),
              ],
              values: [],
            };
          } else if (row.values[columns.indexOf("Type")] == "variation") {
            if (
              products.some(
                (el) => el.sku === row.values[columns.indexOf("Parent")]
              )
            ) {
              products
                .find((el) => el.sku === row.values[columns.indexOf("Parent")])
                .variation.values.push({
                  sku: row.values[columns.indexOf("SKU")],
                  value: row.values[columns.indexOf("Attribute 1 value(s)")],
                  sellingPrice: row.values[columns.indexOf("Sale price")],
                  manageStock:
                    row.values[columns.indexOf("In stock?")] == 1
                      ? true
                      : false,
                });
            }
          }
        }
      });
      if (variation.length > 0) {
        await Promise.all(
          variation.map(async (element, index) => {
            const existVariation = await Variation.findOne({
              values: {
                $all: element[0].split(",").map((item) => item.trim()),
              },
            });
            if (!existVariation) {
              let newVariation = new Variation({
                name: Math.random().toString(36).substring(2, 7),
                values: element[0].split(",").map((item) => item.trim()),
              });
              variationIds.push(newVariation._id);
              await newVariation.save();
            } else {
              variationIds.push(existVariation._id);
            }
          })
        );
        await Promise.all(
          products.map(async (element, index) => {
            const productId = await Helper.uniqueId("P");
            const base64 = await Helper.getBase64FromUrl(products[index].image);
            const image = await Helper.FileUploadOfProductBaseData(
              base64,
              `./uploads/product`,
              productId + "_" + Date.now() + "T",
              products[index].image.split(".").pop()
            );
            products[index].productId = productId;
            products[index].featuredImage = {
              small: image,
              large: image,
            };
            delete products[index].image;
            if (element.variation) {
              products[index].variation.parents = products[
                index
              ].variation.parents.map((item) => {
                return variationIds[item];
              });
            }
          })
        );
        await Promise.all(
          products.map(async (element, index) => {
            const existProduct = await Product.findOne({
              name: element.name,
            });
            if (!existProduct) {
              let newProduct = new Product({ ...element });
              await newProduct.save();
            }
          })
        );
      }
      // }
    } else {
      const { id } = req.user;
      let { category, brand, productId, ...body } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "You Cannot create product without any image.",
        });
      }
      let newProduct = new Product({
        ...body,
        category: category,
        brand: brand,
        productId: productId,
        createdBy: id,
      });

      const product = await newProduct.save();
      product
        ? await Category.updateOne(
            {
              _id: mongoose.Types.ObjectId(category),
            },
            {
              $push: {
                products: product._id,
              },
            }
          )
        : null;
      // Update category with new product
      product
        ? await Brand.updateOne(
            {
              _id: mongoose.Types.ObjectId(product.brand),
            },
            {
              $push: { products: product._id },
              $inc: { productCount: 1 },
            }
          ).exec()
        : null;
      return success(res, "Product Created", product);
    }
    res.status(201).json({
      status: true,
      message: "Successfully product created.",
    });
  } catch (error) {
    console.log(error);
    return failure(res, error.message, error);
  }
};

const Show = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
    })
      .populate({
        path: "category",
        select: "name _id",
      })
      .populate({
        path: "brand",
        select: "title _id",
      })
      .populate("subcategory")
      .populate("variation.parents")
      .lean();
    return product
      ? success(res, "Product Found", product)
      : notFound(res, "No content found", {});
  } catch (error) {
    console.log(error);
    return failure(res, error.message, {});
  }
};

const Update = async (req, res) => {
  try {
    const { id } = req.user;
    let { category, brand, ...updateObj } = req.body;

    updateObj["updatedBy"] = id;
    const oldProduct =
      category || brand
        ? await Product.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
          }).select("category brand")
        : null;

    category ? (updateObj["category"] = category) : null;
    brand ? (updateObj["brand"] = brand) : null;

    const modified = await Product.updateOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        $set: updateObj,
      }
    );

    //Remove product from category

    if (modified && modified.modifiedCount && category && oldProduct) {
      await Category.updateOne(
        { _id: mongoose.Types.ObjectId(oldProduct.category) },
        { $pull: { products: req.params.id } }
      ).exec();

      await Category.updateOne(
        { _id: mongoose.Types.ObjectId(category) },
        { $push: { products: req.params.id } }
      ).exec();
    }
    // Update Brand with new product

    if (modified && modified.modifiedCount && brand && oldProduct) {
      await Brand.updateOne(
        {
          _id: mongoose.Types.ObjectId(oldProduct.brand),
        },
        {
          $pull: { products: req.params.id },
          $inc: { productCount: -1 },
        }
      ).exec();

      await Brand.updateOne(
        {
          _id: mongoose.Types.ObjectId(brand),
        },
        {
          $push: { products: req.params.id },
          $inc: { productCount: 1 },
        }
      );
    }

    const product = await Product.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    })
      .populate({
        path: "category",
        select: "name _id",
      })
      .populate({
        path: "brand",
        select: "title _id",
      })
      .lean();

    return modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Successfull Updated Product", product)
        : notModified(res, "Not modified", product)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    })
      .select("category brand")
      .lean();

    let deleted = await Product.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    product && deleted && deleted.deletedCount
      ? await Category.updateOne(
          {
            _id: mongoose.Types.ObjectId(product.category),
          },
          {
            $pull: {
              products: req.params.id,
            },
          }
        )
      : null;
    // Update category with new product
    product && deleted && deleted.deletedCount
      ? await Brand.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(product.brand),
          },
          {
            $pull: { products: req.params.id },
            $inc: { productCount: -1 },
          }
        ).exec()
      : null;
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
