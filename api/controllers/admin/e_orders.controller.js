const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const uid = require("uniqid");
const Order = require("../../../fabignecommerce/models/Order/Order");
const User = require("../../../fabignecommerce/models/user/user");
const mongoose = require("mongoose");
const moment = require("moment");
const SMSTemplate = require("../../../models/sms_template.model");
const Axios = require("axios");

const Index = async (req, res, next) => {
  try {
    let page = +req.query.page,
      limit = +req.query.limit,
      status = req.query.status,
      fromDate = req.query.fromDate,
      toDate = req.query.toDate,
      searchText = req.query.searchText;

    let query = {};
    status ? (query["status"] = status) : null;
    fromDate && toDate
      ? (query["$and"] = [
          { orderDate: { $gte: fromDate } },
          { orderDate: { $lte: toDate } },
        ])
      : null;
    searchText ? (query["orderId"] = { $regex: searchText }) : null;

    const total = await Order.countDocuments(query);
    let newOrder;
    let pendingOrder;
    let deliveryOrder;
    let cancelledOrder;
    let confirmedOrder;
    if (!status) {
      newOrder = await Order.countDocuments({
        ...query,
        status: "created",
      });
      pendingOrder = await Order.countDocuments({
        ...query,
        status: "pending",
      });
      deliveryOrder = await Order.countDocuments({
        ...query,
        status: "delivered",
      });
      cancelledOrder = await Order.countDocuments({
        ...query,
        status: "cancelled",
      });
      confirmedOrder = await Order.countDocuments({
        ...query,
        status: "confirmed",
      });
    } else {
      if (status == "pending") {
        newOrder = 0;
        pendingOrder = total;
        deliveryOrder = 0;
        cancelledOrder = 0;
        confirmedOrder = 0;
      }
      if (status == "delivered") {
        newOrder = 0;
        pendingOrder = 0;
        deliveryOrder = total;
        cancelledOrder = 0;
        confirmedOrder = 0;
      }
      if (status == "confirmed") {
        newOrder = 0;
        pendingOrder = 0;
        deliveryOrder = 0;
        cancelledOrder = 0;
        confirmedOrder = total;
      }
      if (status == "cancelled") {
        newOrder = 0;
        pendingOrder = 0;
        deliveryOrder = 0;
        cancelledOrder = total;
        confirmedOrder = 0;
      }
    }
    let order = await Order.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "user",
        model: "User",
        select: "name email phone",
      })
      .lean({});
    return order
      ? success(res, "Fetched order", {
          total,
          newOrder,
          pendingOrder,
          deliveryOrder,
          cancelledOrder,
          confirmedOrder,
          page,
          limit,
          order,
        })
      : notFound(res, "No content found", {
          total,
          newOrder,
          pendingOrder,
          deliveryOrder,
          cancelledOrder,
          confirmedOrder,
          limit,
          page,
        });
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Store = async (req, res, next) => {
  try {
    let {
      name,
      email,
      phone,
      deliveryAddress,
      postCode,
      paymentMethod,
      deliveryCharge,
      subTotalPrice,
      isCouponApplied,
      coupon,
      products,
      amountPaid,
      orderStatus,
      transactionId,
    } = req.body;

    products = JSON.parse(products);
    orderStatus = JSON.parse(orderStatus);
    const orderId = await uid();
    let paymentStatus;
    const totalPrice = parseInt(subTotalPrice) + parseInt(deliveryCharge);
    if (amountPaid == totalPrice) {
      paymentStatus = "paid";
    }

    const orderDate = moment().format("YYYY-MM-DD");
    let order;
    if (products.length > 0) {
      const orderData = new Order({
        orderId: orderId,
        user: req.user.id,
        name,
        email,
        orderDate,
        phone,
        deliveryAddress,
        postCode,
        deliveryCharge,
        paymentMethod,
        products,
        subTotalPrice,
        totalPrice,
        isCouponApplied,
        transactionId,
        orderStatus,
      });
      order = await orderData.save();
    }
    return success(res, "Order placed", { order });
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Show = async (req, res, next) => {
  try {
    let temp = await Order.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    const user = await User.countDocuments({
      _id: mongoose.Types.ObjectId(temp.user),
    });

    let order;

    if (user) {
      order = await Order.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      })
        .populate({
          path: "user",
          model: "User",
          select: "name email phone",
        })
        .populate({
          path: "products.id",
          select: "name sku",
          populate: { path: "brand", model: "Brand" },
        })
        .populate({
          path: "canceledProducts.id",
          select: "name sku",
          populate: { path: "brand", model: "Brand" },
        })
        .lean({});
      order.role = "Customer";
    } else {
      order = await Order.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      })
        .populate({
          path: "user",
          model: "Admin",
          select: "name email phone",
        })
        .populate({
          path: "products.id",
          select: "name sku",
          populate: { path: "brand", model: "Brand" },
        })
        .populate({
          path: "canceledProducts.id",
          select: "name sku",
          populate: { path: "brand", model: "Brand" },
        })
        .lean({});
      order.role = "Admin";
    }

    return order
      ? success(res, "Fetched order", order)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Update = async (req, res) => {
  try {
    let { ...updateObj } = req.body;
    let { id } = req.params;
    const status = [
      "Order Received",
      "Processing Order",
      "Handed over to Courier",
      "Delivery by Pathao",
      "Delivery by RedX",
      "Delivered",
      "Cancelled",
      "Returned",
      "Exchanged",
    ];
    const find = await Order.findOne({
      _id: mongoose.Types.ObjectId(id),
    });
    if (updateObj.status) {
      const template = await SMSTemplate.findOne({
        module: "All Order",
        type: "Order",
        status: updateObj.status,
      });
      if (find.orderStatus.some((el) => el.status === updateObj.status)) {
        for (
          let i = status.indexOf(updateObj.status) + 1;
          i < status.length;
          i++
        ) {
          if (find.orderStatus.some((el) => el.status === status[i])) {
            await Order.updateOne(
              { _id: mongoose.Types.ObjectId(id) },
              {
                $pull: {
                  orderStatus: {
                    _id: find.orderStatus.find((el) => el.status === status[i])
                      ._id,
                  },
                },
              }
            ).exec();
          }
        }
        await Order.updateOne(
          {
            _id: mongoose.Types.ObjectId(id),
            "orderStatus.status": updateObj.status,
          },
          {
            $set: {
              "orderStatus.$.time": new Date(),
            },
          }
        );
      } else {
        await Order.findByIdAndUpdate(
          { _id: id },
          {
            $push: {
              orderStatus: {
                status: updateObj.status,
                time: new Date(),
              },
            },
          }
        );
      }
      if (template) {
        const api_key = "53dGFfgGHO6UMSh46E63OWfu5tENdlQFN5KtPCgh";
        let to = find.phone;
        let msg = template.sms;
        if (template.sms.includes("{id}")) {
          msg = msg.replace("{id}", find.orderId);
        }
        const config = {
          method: "GET",
          url: `https://api.sms.net.bd/sendsms?api_key=${api_key}&msg=${msg}&to=${to}`,
          headers: {
            Accept: "application/json",
          },
        };
        await Axios(config);
      }
    } else if (updateObj.paymentStatus) {
      const template = await SMSTemplate.findOne({
        module: "All Order",
        type: "Order Payment",
        status: updateObj.paymentStatus,
      });
      await Order.updateOne(
        {
          _id: mongoose.Types.ObjectId(id),
        },
        {
          $set: updateObj,
        }
      );
      if (template) {
        const api_key = "53dGFfgGHO6UMSh46E63OWfu5tENdlQFN5KtPCgh";
        let to = find.phone;
        let msg = template.sms;
        if (template.sms.includes("{id}")) {
          msg = msg.replace("{id}", find.orderId);
        }
        const config = {
          method: "GET",
          url: `https://api.sms.net.bd/sendsms?api_key=${api_key}&msg=${msg}&to=${to}`,
          headers: {
            Accept: "application/json",
          },
        };
        await Axios(config);
      }
    } else {
      await Order.updateOne(
        {
          _id: mongoose.Types.ObjectId(id),
        },
        {
          $set: updateObj,
        }
      );
    }

    const order = await Order.findOne({
      _id: mongoose.Types.ObjectId(id),
    });
    return success(res, "Successfully Updated Order", order);
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const CancelItem = async (req, res) => {
  try {
    let { ...updateObj } = req.body;
    let { id } = req.params;
    const findOrder = await Order.findOne({ _id: mongoose.Types.ObjectId(id) });
    let product = updateObj.product;
    product.id = product.id._id;
    console.log(findOrder.subTotalPrice - product.subTotal);
    let updatedSubTotal = findOrder.subTotalPrice - product.subTotal;
    let updatedTotal = findOrder.totalPrice - product.subTotal;
    await Order.updateOne(
      { _id: mongoose.Types.ObjectId(id) },
      {
        $pull: {
          products: {
            _id: mongoose.Types.ObjectId(product._id),
          },
        },
      }
    ).exec();
    const modified = await Order.updateOne(
      {
        _id: mongoose.Types.ObjectId(id),
      },
      { $push: { canceledProducts: product } },
      {
        $set: {
          subTotalPrice: updatedSubTotal,
          totalPrice: updatedTotal,
        },
      }
    );
    const order = modified.matchedCount
      ? await Order.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
          .populate({
            path: "user",
            model: "User",
            select: "name email phone",
          })
          .lean({})
      : {};
    return modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Successfully Updated Order", order)
        : notModified(res, "Not modified", order)
      : notFound(res, "No content found", {});
  } catch (error) {
    console.log("error");
    console.log(error);
    return failure(res, error.message, error);
  }
};

const Delete = async (req, res) => {
  try {
    let deleted = await Order.deleteOne({
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
  CancelItem,
  Delete,
};
