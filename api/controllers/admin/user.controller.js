const bcrypt = require("bcryptjs");
const ExcelJS = require("exceljs");
const { Readable } = require("stream");
const User = require("../../../fabignecommerce/models/user/user");
const { UploadFile, IsValidURL } = require("../../helpers");
const { isMongooseId } = require("../../middleware/checkId.middleware");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");

// List of items
const Index = async (req, res, next) => {
  try {
    const { limit, page } = PaginateQueryParams(req.query);
    const totalItems = await User.countDocuments().exec();
    const results = await User.find({})
      .sort({ _id: -1 })
      .skip(parseInt(page) * parseInt(limit) - parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    results.map((item, index) => {
      if (item.image.length > 0) {
        results[index].image = "https://api.efgtailor.com" + item.image;
      }
    });

    res.status(200).json({
      status: true,
      data: results,
      pagination: Paginate({ page, limit, totalItems }),
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Store item
const Store = async (req, res, next) => {
  try {
    const files = req.files;

    if (files.userList) {
      const workbook = new ExcelJS.Workbook();
      var stream = new Readable();
      stream.push(files.userList.data);
      stream.push(null);
      const worksheet = await workbook.csv.read(stream);
      let columns = [];
      worksheet.eachRow(async (row, rowNumber) => {
        if (rowNumber == 1) {
          columns = row.values;
        } else {
          const existEmail = await User.findOne({
            email: row.values[columns.indexOf("user_email")],
          });
          const existPhone = await User.findOne({
            phone:
              row.values[columns.indexOf("billing_phone")]
                .toString()
                .charAt(0) == "0"
                ? row.values[columns.indexOf("billing_phone")]
                : "0" + row.values[columns.indexOf("billing_phone")],
          });
          if (!existEmail && !existPhone) {
            const hashPassword = await bcrypt.hash("1234", 10);
            let user = new User({
              name: row.values[columns.indexOf("display_name")],
              email: row.values[columns.indexOf("user_email")],
              password: hashPassword,
              phone:
                row.values[columns.indexOf("billing_phone")]
                  .toString()
                  .charAt(0) == "0"
                  ? row.values[columns.indexOf("billing_phone")]
                  : "0" + row.values[columns.indexOf("billing_phone")],
              shippingAddress: row.values[columns.indexOf("billing_address_1")],
              city: row.values[columns.indexOf("billing_city")],
            });
            user = await user.save();
          }
        }
      });
    } else {
      const {
        name,
        email,
        phone,
        gender,
        maritalStatus,
        dob,
        shippingAddress,
        deliveryAddress,
        city,
        country,
        postCode,
        postOffice,
        upazila,
        password,
      } = req.body;

      // Check email already exist or not
      const existEmail = await User.findOne({ email });
      if (existEmail)
        return res.status(422).json({
          status: false,
          message: "Email already used.",
        });

      // check phone already exist or not
      const existPhone = await User.findOne({ phone });
      if (existPhone)
        return res.status(422).json({
          status: false,
          message: "Phone already used.",
        });

      // Upload file
      const uploadedFile = await UploadFile(files.image, "./uploads/user/");
      if (!uploadedFile) {
        return res.status(501).json({
          status: false,
          message: "Failed to upload image",
        });
      }

      // Password Hash
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        phone,
        gender,
        maritalStatus,
        dob,
        shippingAddress,
        deliveryAddress,
        city,
        country,
        postCode,
        postOffice,
        upazila,
        image: uploadedFile,
        password: hashPassword,
      });

      const saveUser = await newUser.save();
      if (!saveUser)
        return res.status(501).json({
          status: false,
          message: "Failed to create user.",
        });
    }

    res.status(201).json({
      status: true,
      message: "Successfully user created.",
    });
  } catch (error) {
    console.log("error");
    console.log(error);
    if (error) next(error);
  }
};

// Show specific item
const Show = async (req, res, next) => {
  try {
    const { id } = req.params;
    await isMongooseId(id);

    let result = await User.findById(id, {
      password: 0,
      status: 0,
      createdAt: 0,
      updatedAt: 0,
    });

    if (result && result.image) {
      result.image = "https://api.efgtailor.com" + result.image;
    }

    res.status(200).json({
      status: true,
      body: result,
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

    const is_available = await User.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "User is not available",
      });
    }

    if (is_available.email != updateObj.email) {
      // Check email already exist or not
      const existEmail = await User.findOne({ email: updateObj.email });
      if (existEmail)
        return res.status(422).json({
          status: false,
          message: "Email already used.",
        });
    }
    if (is_available.phone != updateObj.phone) {
      // check phone already exist or not
      const existPhone = await User.findOne({ phone: updateObj.phone });
      if (existPhone)
        return res.status(422).json({
          status: false,
          message: "Phone already used.",
        });
    }

    if (IsValidURL(updateObj.image)) {
      delete updateObj.image;
    }

    if (files) {
      if (files.image) {
        // Upload file
        const uploadedFile = await UploadFile(files.image, "./uploads/user/");
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

    await User.findByIdAndUpdate(id, {
      $set: updateObj,
    }).exec();

    res.status(201).json({
      status: true,
      message: "User updated",
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

    const isAvailable = await User.findById({ _id: id });
    if (!isAvailable) {
      return res.status(404).json({
        status: false,
        message: "User not available.",
      });
    }

    await User.findByIdAndDelete({ _id: id });

    res.status(200).json({
      status: true,
      message: "Successfully user deleted.",
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
