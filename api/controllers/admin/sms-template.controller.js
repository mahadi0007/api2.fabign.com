const {
  success,
  failure,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const SMSTemplate = require("../../../models/sms_template.model");
const validator = require("../../validators/sms_template.validator");

// Structure of items
const GetTemplate = async (req, res, next) => {
  try {
    let templates = require("../../../fabignecommerce/models/sms-template.json");
    success(res, "Sms Template Structure Found", templates);
  } catch (error) {
    if (error) next(error);
  }
};

// List of items
const Index = async (req, res, next) => {
  try {
    const results = await SMSTemplate.find({}, { created_by: 0 });

    res.status(200).json({
      status: true,
      data: results,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Store an item
const Store = async (req, res, next) => {
  try {
    const created_by = req.user.id;
    const { module, type, status, sms } = req.body;

    // Validate check
    const validate = await validator.Store(req.body);
    if (!validate.isValid) {
      return res.status(422).json({
        status: false,
        message: validate.error,
      });
    }

    // Check exist
    const isExist = await SMSTemplate.findOne({
      $and: [{ module, type, status }],
    });
    if (isExist) {
      return res.status(409).json({
        status: false,
        message: `Template already exist.`,
      });
    }

    const newTemplate = new SMSTemplate({
      module,
      type,
      status,
      sms,
      created_by,
    });

    await newTemplate.save();

    res.status(201).json({
      status: true,
      result: newTemplate,
      message: "Successfully template created.",
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Show specific item
const Show = async (req, res, next) => {
  try {
    const template = await SMSTemplate.findOne({
      _id: req.params.id,
    });

    return template
      ? success(res, "Template Found", template)
      : notFound(res, "No content found", {});
  } catch (error) {
    return failure(res, error.message, {});
  }
};

// Update specific item
const Update = async (req, res) => {
  try {
    const { id } = req.user;
    let { ...updateObj } = req.body;
    updateObj["updatedBy"] = id;

    const is_available = await SMSTemplate.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "Template is not available",
      });
    }

    if (
      is_available.module !== updateObj.module ||
      is_available.type !== updateObj.type ||
      is_available.status !== updateObj.status
    ) {
      const isExist = await SMSTemplate.findOne({
        $and: [
          {
            module: updateObj.module,
            type: updateObj.type,
            status: updateObj.status,
          },
        ],
      });
      if (isExist) {
        return res.status(409).json({
          status: false,
          message: `Template already exist.`,
        });
      }
    }
    await SMSTemplate.updateOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        $set: updateObj,
      }
    );
    const template = await SMSTemplate.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    return success(res, "Successfully Updated Template", template);
  } catch (error) {
    return failure(res, error.message, error);
  }
};

module.exports = {
  GetTemplate,
  Index,
  Store,
  Show,
  Update,
};
