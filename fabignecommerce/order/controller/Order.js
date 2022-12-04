const {
  success,
  failure,
  notFound,
  notModified,
} = require("../../common/helper/responseStatus");
const Order = require("../../models/Order/Order");
const uid = require("uniqid");
const mongoose = require("mongoose");
const moment = require("moment");
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
// const is_live = false;
const is_live = true;
const bkash = require("../../bkash/bkash");
const Helper = require("../../common/helper/index");
const nodemailer = require("nodemailer");

class OrderController {
  async placeOrder(req, res, next) {
    try {
      const {
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
      } = req.body;

      const orderId = await uid();

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "mail.efgfashion.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "info@efgfashion.com", // generated ethereal user
          pass: "info2022@", // generated ethereal password
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: "info@efgfashion.com", // sender address
        to: "maaysa456@gmail.com", // list of receivers
        subject: "Node Contact Request", // Subject line
        text: "Hello world?", // plain text body
        // html: output, // html body
      };

      // send mail with defined transport object
      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     return console.log(error);
      //   }
      //   console.log("Message sent: %s", info.messageId);
      //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      //   // res.render("contact", { msg: "Email has been sent" });
      // });

      let paymentStatus;
      const totalPrice = subTotalPrice + deliveryCharge;
      if (amountPaid == totalPrice) {
        paymentStatus = "paid";
      }

      const orderDate = moment().format("YYYY-MM-DD");

      if (paymentMethod == "card") {
        const transactionId = uid(`transaction_${orderId}`);

        const data = {
          total_amount: totalPrice,
          currency: "BDT",
          tran_id: transactionId,
          // success_url: `${process.env.BASE_URL}api/v1/e-efg/order/successSSLPayment?transactionId=${transactionId}`,
          success_url: `${process.env.BASE_URL}api/v1/e-efg/order/successSSLPayment`,
          fail_url: `${process.env.BASE_URL}api/v1/e-efg/order/failSSLPayment`,
          cancel_url: `${process.env.BASE_URL}api/v1/e-efg/order/cancelSSLPayment`,
          ipn_url: `${process.env.BASE_URL}api/v1/e-efg/order/notificationSSLPayment`,
          shipping_method: "No",
          products: [products.length > 0 && products],
          product_name:
            products?.length > 0
              ? products.map((i) => i.productName).join(", ")
              : "",
          product_category: "Tailoring",
          product_profile: "general",
          cus_name: name,
          cus_email: email,
          cus_add1: deliveryAddress,
          cus_city: "",
          cus_state: "",
          cus_postcode: postCode,
          cus_country: "",
          cus_phone: phone,
        };
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then(async (apiResponse) => {
          // Redirect the user to payment gateway
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
          let GatewayPageURL = apiResponse.GatewayPageURL;
          return success(res, GatewayPageURL, { order });
        });
      } else {
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
            orderStatus,
          });
          order = await orderData.save();
        }

        return success(res, "Order placed", {
          order,
        });
      }
    } catch (error) {
      console.log(error);
      return failure(res, error.message, error);
    }
  }
  async getAllOrder(req, res, next) {
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

      const total = await Order.countDocuments({ ...query, user: req.user.id });
      let order = await Order.find({ ...query, user: req.user.id })
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "user",
          model: "User",
          select: "name email phone",
        })
        .populate({
          path: "products.id",
          select: "name featuredImage",
        })
        .lean({});
      return order
        ? success(res, "Fetched order", {
            total,
            page,
            limit,
            order,
          })
        : notFound(res, "No content found", {
            total,
            page,
            limit,
          });
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
  async getSingleOrder(req, res, next) {
    try {
      let order = await Order.findOne({
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
      return order
        ? success(res, "Fetched order", order)
        : notFound(res, "No content found", {});
    } catch (error) {
      console.log("error");
      console.log(error);
      return failure(res, error.message, error);
    }
  }
  async updateOrder(req, res) {
    try {
      let { ...updateObj } = req.body;
      let { id } = req.params;
      const modifiedOrder = await Order.updateOne(
        {
          orderId: id,
        },
        {
          $set: updateObj,
        }
      );
      const order = modifiedOrder.matchedCount
        ? await Order.findOne({
            orderId: req.params.id,
          })
            .populate({
              path: "user",
              model: "User",
              select: "name email phone",
            })
            .lean({})
        : {};
      return success(res, "Successfully Updated Order", { order });
    } catch (error) {
      console.log("error");
      console.log(error);
      return failure(res, error.message, error);
    }
  }
  async deleteOrder(req, res, next) {
    try {
      let deletedOrder = await Order.deleteOne({
        orderId: req.params.id,
      });

      return deletedOrder.deletedCount
        ? success(res, "Successfully deleted", {
            deletedOrder,
          })
        : notModified(res, "Not deleted", {});
    } catch (error) {
      return failure(res, error.message, error);
    }
  }
  async placeBkashPayment(req, res, next) {
    // console.log(req);
    try {
      const { paymentRequest } = req.body;
      const result = await bkash.createPayment(paymentRequest);
      return success(res, "Bkash Payment placed", result);
    } catch (error) {
      console.log(error);
      return failure(res, error.message, error);
    }
  }
  async executeBkashPayment(req, res, next) {
    try {
      console.log(req.body);
      const { paymentID } = req.body;
      const result = await bkash.executePayment(paymentID);
      console.log(result);
      return success(res, "Bkash Payment Executed", result);
    } catch (error) {
      console.log(error);
      return failure(res, error.message, error);
    }
  }
  async successSSLPayment(req, res, next) {
    try {
      // console.log(res.body);
      // const { transactionId } = req.query;
      console.log("successSSLPayment");
      const transactionId = req.body.tran_id;
      console.log(transactionId);
      if (!transactionId) {
        return res.json({ message: "transactionId must be required" });
        // return res.redirect(`${process.env.CLIENT_URL}`);
      } else {
        await Order.updateOne(
          {
            transactionId,
          },
          {
            $set: { paymentStatus: "paid" },
          }
        );
      }
      // return res.redirect(`${process.env.CLIENT_URL}`);
      return res.status(200).json({
        data: req.body,
        message: "Payment success",
      });
      // }
    } catch (error) {
      console.log("error");
      console.log(error);
      // return res.redirect(`${process.env.CLIENT_URL}`);
      return failure(res, error.message, error);
      // return res.status(200).json({
      //   data: req.body,
      //   message: "Payment success",
      // });
    }
  }
  async failSSLPayment(req, res, next) {
    console.log("failSSLPayment");
    const transactionId = req.body.tran_id;
    await Order.deleteOne({
      transactionId,
    });
    // return res.redirect(`${process.env.CLIENT_URL}/cart`);
    return res.status(200).json({
      data: req.body,
      message: "Payment failed",
    });
  }
  async cancelSSLPayment(req, res, next) {
    console.log("cancelSSLPayment");
    const transactionId = req.body.tran_id;
    await Order.deleteOne({
      transactionId,
    });
    // return res.redirect(`${process.env.CLIENT_URL}/cart`);
    return res.status(200).json({
      data: req.body,
      message: "Payment cancelled",
    });
  }
  async notificationSSLPayment(req, res, next) {
    console.log("notificationSSLPayment");
    return res.status(200).json({
      data: req.body,
      message: "Payment notification",
    });
  }
}

module.exports = new OrderController();
