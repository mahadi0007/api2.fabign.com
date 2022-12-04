const Axios = require("axios");
const Order = require("../../../fabignecommerce/models/Order/Order");

// Index of cities
const GetCities = async (req, res, next) => {
  try {
    const config = {
      method: "GET",
      url: "https://hermes-api.p-stageenv.xyz/aladdin/api/v1/countries/1/city-list",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU0NDFlNzcwNTk0MWZkMTVmMjdmNjM5ZjRlYTQ3NzY5ODM5ZDA2ZDdlMzRhNDkxNzYxMmYwODIwN2Q2Y2I0MWQyMzFmMWE2MjNiMjcxMjFkIn0`,
      },
    };

    const response1 = await Axios(config);
    // console.log(response1.data.data);
    res.status(200).json({
      status: true,
      data: response1.data.data,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Index of zones
const GetZones = async (req, res, next) => {
  try {
    const config = {
      method: "GET",
      url: `https://hermes-api.p-stageenv.xyz/aladdin/api/v1/cities/${req.params.city}/zone-list`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU0NDFlNzcwNTk0MWZkMTVmMjdmNjM5ZjRlYTQ3NzY5ODM5ZDA2ZDdlMzRhNDkxNzYxMmYwODIwN2Q2Y2I0MWQyMzFmMWE2MjNiMjcxMjFkIn0`,
      },
    };

    const response1 = await Axios(config);
    // console.log(response1.data.data);
    res.status(200).json({
      status: true,
      data: response1.data.data,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Index of areas
const GetAreas = async (req, res, next) => {
  try {
    const config = {
      method: "GET",
      url: `https://hermes-api.p-stageenv.xyz/aladdin/api/v1/zones/${req.params.zone}/area-list`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU0NDFlNzcwNTk0MWZkMTVmMjdmNjM5ZjRlYTQ3NzY5ODM5ZDA2ZDdlMzRhNDkxNzYxMmYwODIwN2Q2Y2I0MWQyMzFmMWE2MjNiMjcxMjFkIn0`,
      },
    };

    const response1 = await Axios(config);
    // console.log(response1.data.data);
    res.status(200).json({
      status: true,
      data: response1.data.data,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Create Pathao Order
const CreateOrder = async (req, res, next) => {
  try {
    const {
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_city,
      recipient_zone,
      recipient_area,
      item_quantity,
      orderId,
    } = req.body;
    const config = {
      method: "POST",
      url: `https://hermes-api.p-stageenv.xyz/aladdin/api/v1/orders`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU0NDFlNzcwNTk0MWZkMTVmMjdmNjM5ZjRlYTQ3NzY5ODM5ZDA2ZDdlMzRhNDkxNzYxMmYwODIwN2Q2Y2I0MWQyMzFmMWE2MjNiMjcxMjFkIn0.eyJhdWQiOiIyNjciLCJqdGkiOiJlNDQxZTc3MDU5NDFmZDE1ZjI3ZjYzOWY0ZWE0Nzc2OTgzOWQwNmQ3ZTM0YTQ5MTc2MTJmMDgyMDdkNmNiNDFkMjMxZjFhNjIzYjI3MTIxZCIsImlhdCI6MTY2MjU1ODgyMCwibmJmIjoxNjYyNTU4ODIwLCJleHAiOjE2NjI5OTA4MjAsInN1YiI6IjM1MiIsInNjb3BlcyI6W119.nnhm3tGqVPKlex5UqQHm7ldh8tYelv4cGEr_V6YaOYuQS_Q2HL8KuYz3HRNUaaB3uqdCVfzgnvsS8pBPiPOhZVdH5BVbCEPwDN7m81hLBODmwoopuoYpy_AHmjVQJKpRg7Ce7B1S4CGGA4QT3fV2qLvaqgMfy4Vqz687_MLdED3b0bVw9nrHKPOsI7_dgqd0rd-Zi5bakAT6zDjGl2USHJwo-CO5N-z61GBKTuL3I_z8H_svE-9KrPOOfVsesSPKypnYU-nnaqTEv3WoFk7DXASiJAW5f9BzvJTSl9wCJ3P4FDDoI8qu7bXGIkyyxif6wTOu_Qnk7Gfs6G-yC9f1xCENvltpd97bvWp0K3ayLLnaQuCoSqJeL3WyIbDBHZrHJ5riu69RvZ1uWjdBPajc-tS19kNbul3BCG5kVCbO5mkSt_sjWIpNt16Af6_8zwVJ7ym1o7Y5Ozdx5KfDUkEUct3fDtzilmBIsw748gfBXBOoTf-2wT-2rXbebG33CiuEQPN39Hed-PJau3RGkMNT8xlKTfwkU8IBerNPwydf1EoGt_S7dkJM7Q1CfH13RUIGVPqnw7M3g1W6hYviR8r-03b1x38_5xdv1r-IcTXCL56kUGV9yJCmUdP3Lag7npnPexWS3xRTYmAZMSZ71m1j1vvOsYy2r6QYR7qehI3clM4`,
      },
      data: {
        store_id: 55652,
        recipient_name,
        recipient_phone,
        recipient_address,
        recipient_city,
        recipient_zone,
        recipient_area,
        delivery_type: 48,
        item_type: 2,
        item_quantity,
        item_weight: 0.5,
        amount_to_collect: 0,
      },
    };

    const response1 = await Axios(config);
    console.log(response1.data);
    await Order.updateOne(
      {
        orderId,
      },
      {
        $set: {
          shippingCompany: "Pathao",
          trackingNumber: response1.data.data.consignment_id,
          deliveryStatus: response1.data.data.order_status,
          deliveryCharge: response1.data.data.delivery_fee,
        },
      }
    );
    res.status(200).json({
      status: true,
      data: response1.data,
      // data: [],
    });
  } catch (error) {
    console.log("error");
    console.log(error);
    if (error) next(error);
  }
};

module.exports = {
  GetCities,
  GetZones,
  GetAreas,
  CreateOrder,
};
