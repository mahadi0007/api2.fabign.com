const mongoose = require("mongoose");
const TopBar = require("../../../models/topbar.model");
const Validator = require("../../validators/topbar.validator");
const { isMongooseId } = require("../../middleware/checkId.middleware");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");
const {
  success,
  failure,
  notFound,
} = require("../../../fabignecommerce/common/helper/responseStatus");
const { UploadFile, HostURL, IsValidURL } = require("../../helpers");

// Index of Topbar
const Index = async (req, res, next) => {
  try {
    const { limit, page } = PaginateQueryParams(req.query);

    const totalItems = await TopBar.countDocuments().exec();
    const results = await TopBar.find({}, { created_by: 0 })
      .sort({ _id: -1 })
      .skip(parseInt(page) * parseInt(limit) - parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    const items = [];

    if (results && results.length) {
      for (let i = 0; i < results.length; i++) {
        const element = results[i];

        if (element) {
          items.push({
            _id: element._id,
            title: element.title,
            link: element.link,
            is_default: element.is_default,
            is_hidden: element.is_hidden,
            icon: HostURL(req) + "uploads/topbar/icons/" + element.icon,
          });
        }
      }
    }

    res.status(200).json({
      status: true,
      data: items,
      pagination: Paginate({ page, limit, totalItems }),
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Store an item of Topbar
const Store = async (req, res, next) => {
  try {
    const created_by = req.user.id;
    const files = req.files;
    const { title, link } = req.body;

    const validate = await Validator.Store(req.body);
    if (!validate.isValid) {
      return res.status(422).json({
        status: false,
        message: validate.message,
      });
    }

    const uploadIcon = await UploadFile(files.icon, "./uploads/topbar/icons/");
    if (!uploadIcon) {
      return res.status(501).json({
        status: false,
        message: "Failed to upload image",
      });
    }

    const newTopbar = new TopBar({
      title: title,
      link: link,
      icon: uploadIcon,
      created_by: created_by,
    });

    await newTopbar.save();

    res.status(201).json({
      status: true,
      message: "Successfully created new Topbar",
    });
  } catch (error) {
    if (error) next(error);
  }
};

const Show = async (req, res, next) => {
  try {
    let result = await TopBar.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    if (result) {
      result.icon = HostURL(req) + "uploads/topbar/icons/" + result.icon;
    }
    return result
      ? success(res, "TopBar Found", result)
      : notFound(res, "No Content Found", {});
  } catch (error) {
    return failure(res, error.message, error);
  }
};

const Update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;
    let { ...updateObj } = req.body;
    await isMongooseId(id);

    const is_available = await TopBar.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "Top bar is not available",
      });
    }

    // check similar title available
    if (updateObj?.title) {
      const is_title_available = await TopBar.find({
        $and: [{ _id: { $ne: id } }, { title: updateObj.title }],
      });

      if (is_title_available && is_title_available.length > 0) {
        return res.status(409).json({
          status: false,
          message: `${title} already exist.`,
        });
      }
    }
    if (updateObj?.icon && IsValidURL(updateObj?.icon)) {
      delete updateObj.icon;
    }
    if (files) {
      if (files?.icon) {
        const uploadIcon = await UploadFile(
          files.icon,
          "./uploads/topbar/icons/"
        );
        if (!uploadIcon) {
          return res.status(501).json({
            status: false,
            message: "Failed to upload image",
          });
        }
        updateObj["icon"] = uploadIcon;
      }
    }

    await TopBar.findByIdAndUpdate(id, {
      $set: updateObj,
    }).exec();

    res.status(201).json({
      status: true,
      message: "Top bar updated",
    });
  } catch (error) {
    console.log("error");
    console.log(error);
    if (error) {
      next(error);
    }
  }
};

const MakeDefault = async (req, res, next) => {
  try {
    const { id } = req.params;
    await isMongooseId(id);

    // update to undefault
    await TopBar.updateMany({ $set: { is_default: false } });

    // update to default
    await TopBar.findOneAndUpdate(
      { $and: [{ _id: id }] },
      { $set: { is_default: true } }
    );

    res.status(201).json({
      status: false,
      message: "You made it default",
    });
  } catch (error) {
    if (error) next(error);
  }
};

const Delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await isMongooseId(id);

    const is_available = await TopBar.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "Top bar is not available",
      });
    }

    // Delete topbar from database
    await TopBar.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  Index,
  Store,
  Show,
  Update,
  MakeDefault,
  Delete,
};
