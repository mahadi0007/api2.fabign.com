const bcrypt = require("bcryptjs");
const Admin = require("../../../models/admin.model");
const Validator = require("../../validators/admin.validator");
const { HostURL, UploadFile, IsValidURL } = require("../../helpers");
const { isMongooseId } = require("../../middleware/checkId.middleware");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");

// List of items
const Index = async (req, res, next) => {
  try {
    const items = [];
    const { query } = req.query;
    const { limit, page } = PaginateQueryParams(req.query);

    const totalItems = await Admin.countDocuments({
      _id: { $ne: req.user.id },
    }).exec();
    const results = await Admin.find(
      { _id: { $ne: req.user.id } },
      { name: 1, phone: 1, role: 1, status: 1, isOnline: 1, image: 1 }
    )
      .populate("role", "role")
      .exec();

    if (results && results.length) {
      for (let i = 0; i < results.length; i++) {
        const element = results[i];

        if (element.role) {
          items.push({
            _id: element._id,
            name: element.name,
            phone: element.phone,
            role: element.role ? element.role.role : null,
            status: element.status,
            isOnline: element.isOnline,
            image: HostURL(req) + "uploads/admin/" + element.image,
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

// Store item
const Store = async (req, res, next) => {
  try {
    const image = req.files;
    const {
      name,
      email,
      phone,
      present_address,
      permanent_address,
      role,
      password,
    } = req.body;

    // check mongoose ID
    await isMongooseId(role);

    // Validate check
    const validate = await Validator.Store({ ...req.body, image });
    if (!validate.isValid) {
      return res.status(422).json({
        status: false,
        message: validate.error,
      });
    }

    // Check email already exist or not
    const existEmail = await Admin.findOne({ email: email });
    if (existEmail)
      return res.status(422).json({
        status: false,
        message: "Email already used.",
      });

    // check phone already exist or not
    const existPhone = await Admin.findOne({ phone: phone });
    if (existPhone)
      return res.status(422).json({
        status: false,
        message: "Phone already used.",
      });

    // Upload file
    const uploadedFile = await UploadFile(image.image, "./uploads/admin/");
    if (!uploadedFile) {
      return res.status(501).json({
        status: false,
        message: "Failed to upload image",
      });
    }

    // Password Hash
    const hashPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name,
      email,
      phone,
      address: { present_address, permanent_address },
      role: role,
      image: uploadedFile,
      password: hashPassword,
    });

    const saveAdmin = await newAdmin.save();
    if (!saveAdmin)
      return res.status(501).json({
        status: false,
        message: "Failed to create admin.",
      });

    res.status(201).json({
      status: true,
      message: "Successfully admin created.",
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Show specific item
const Show = async (req, res, next) => {
  try {
    const { id } = req.params;
    await isMongooseId(id);

    let result = await Admin.findById(id, {
      password: 0,
      status: 0,
      createdAt: 0,
      updatedAt: 0,
    })
      .populate("role", "role")
      .exec();

    if (result && result.image)
      result.image = HostURL(req) + "uploads/admin/" + result.image;

    res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Update specific item
const Update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;
    let { ...updateObj } = req.body;
    await isMongooseId(id);

    const is_available = await Admin.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "Admin is not available",
      });
    }

    if (is_available.email != updateObj.email) {
      // Check email already exist or not
      const existEmail = await Admin.findOne({ email: updateObj.email });
      if (existEmail)
        return res.status(422).json({
          status: false,
          message: "Email already used.",
        });
    }
    if (is_available.phone != updateObj.phone) {
      // check phone already exist or not
      const existPhone = await Admin.findOne({ phone: updateObj.phone });
      if (existPhone)
        return res.status(422).json({
          status: false,
          message: "Phone already used.",
        });
    }
    if (updateObj.present_address && updateObj.permanent_address) {
      updateObj["address"] = {
        present_address: updateObj.present_address,
        permanent_address: updateObj.permanent_address,
      };
      delete updateObj.present_address;
      delete updateObj.permanent_address;
    }

    if (IsValidURL(updateObj.image)) {
      delete updateObj.image;
    }

    if (files) {
      if (files.image) {
        // Upload file
        const uploadedFile = await UploadFile(files.image, "./uploads/admin/");
        if (!uploadedFile) {
          return res.status(501).json({
            status: false,
            message: "Failed to upload image",
          });
        }
        updateObj["image"] = uploadedFile;
      }
    }

    if (updateObj.password) {
      const hashPassword = await bcrypt.hash(updateObj.password, 10);
      updateObj["password"] = hashPassword;
    }
    if (updateObj.password.length === 0) {
      delete updateObj.password;
    }
    await Admin.findByIdAndUpdate(id, {
      $set: updateObj,
    }).exec();

    res.status(201).json({
      status: true,
      message: "Admin updated",
    });
  } catch (error) {
    console.log(error);
    if (error) {
      next(error);
    }
  }
};

// Delete specific item
const Delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await isMongooseId(id);

    const isAvailable = await Admin.findById({ _id: id });
    if (!isAvailable) {
      return res.status(404).json({
        status: false,
        message: "Admin not available.",
      });
    }

    await Admin.findByIdAndDelete({ _id: id });

    res.status(200).json({
      status: true,
      message: "Successfully admin deleted.",
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
  Delete,
};
