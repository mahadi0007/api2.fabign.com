const {
  success,
  notFound,
  notModified,
  failure,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const DeliveryCharge = require("../../../fabignecommerce/models/Order/DeliveryCharge");

const Index = async (req, res, next) => {
  try {
    let zones = require("../../../fabignecommerce/models/zones.json");
    success(res, "Delivery charge calculated", zones);
  } catch (error) {
    return failure(res, error.message, error.stack);
  }
};

const Update = async (req, res) => {
  try {
    let {
      zoneInsideDhaka,
      zoneInsideDhakaCharge,
      zoneOutsideDhaka,
      zoneOutsideDhakaCharge,
      origin,
    } = req.body;
    let zone = await DeliveryCharge.findOne({ origin: origin });
    let body = {},
      modified,
      newDeliveryCharge;
    zoneInsideDhaka ? (body["zoneInsideDhaka"] = zoneInsideDhaka) : null;
    zoneInsideDhakaCharge
      ? (body["zoneInsideDhakaCharge"] = zoneInsideDhakaCharge)
      : null;
    zoneOutsideDhaka ? (body["zoneOutsideDhaka"] = zoneOutsideDhaka) : null;
    zoneOutsideDhakaCharge
      ? (body["zoneOutsideDhakaCharge"] = zoneOutsideDhakaCharge)
      : null;
    origin ? (body["origin"] = origin) : null;
    if (zone) {
      modified = await DeliveryCharge.updateOne(
        { origin: origin },
        { $set: body }
      );
    } else {
      let delivery = new DeliveryCharge({
        ...body,
      });
      newDeliveryCharge = await delivery.save();
    }
    return zone && modified && modified.matchedCount
      ? modified.modifiedCount
        ? success(res, "Updated Delivery Charge ", modified)
        : notModified(res, "Not modified", modified)
      : newDeliveryCharge
      ? success(res, "Created delivery charge", newDeliveryCharge)
      : failure(res, "Failed to Create", {});
  } catch (error) {
    return failure(res, error.message, error.stack);
  }
};

module.exports = {
  Index,
  Update,
};
