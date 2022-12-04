const { failure, success } = require("./responseStatus");
const fs = require("fs");
const moment = require("moment");
const converter = require("hex2dec");
const Axios = require("axios");

const FileUpload = async (data, path, name) => {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    const image = data;
    const extension = image.name.split(".").pop();

    const newName = name + "." + extension;
    const uploadPath = path + newName;

    const moveFile = image.mv(uploadPath);
    if (moveFile) return path.split(".")[1] + newName;
  } catch (error) {
    if (error) return error;
  }
};

const UniqueCode = async () => {
  try {
    let data = generateUniqueId({ length: 8, useLetters: false });
    let checkAvaliable = await Order.findOne({ orderCode: data });
    if (checkAvaliable) {
      UniqueCode();
    }
    return data;
  } catch (error) {
    return error;
  }
};

const uniqueId = async (id) => {
  let date = moment();
  let year = date.format("YYYY");
  let month = Number(date.format("MM"));
  let week = date.format("ww");
  let day = Number(date.format("DD"));
  let hour = Number(date.format("HH"));
  let min = date.format("mm");
  let second = date.format("ss");
  let mlSecond = date.milliseconds();
  let a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let c = "CFWEJMNOPQ",
    d = "ZXBSGIYAKF";
  let fy = year.slice(0, 2);
  let ly = year.slice(2, 4);
  mlSecond = mlSecond.toString();

  let uniqueIdCode =
    Number(ly) +
    19 +
    // d[+ly[0]] +
    fy +
    a[month] +
    // week +
    day +
    a[hour] +
    min +
    //converter.decToHex(min).toString().toUpperCase() +
    second +
    converter.decToHex(mlSecond).toUpperCase() +
    id;

  return uniqueIdCode;
};

const fileUploaderForProduct = async (req, res) => {
  try {
    let { type, productId } = req.body;
    const files = req.files.files;
    const length = files ? files.length : 0;

    let i = 0;
    let names = [];
    productId = productId ? productId : await uniqueId("P");

    if (files && !files.length) {
      names.push(await uploadFile(files, "./uploads/product/", productId, "T"));
    }
    if (files && length > 0) {
      for (i = 0; i < length; i++) {
        names.push(
          await uploadFile(files[i], "./uploads/product/", productId, i)
        );
      }
    }
    return success(res, "File uploaded", {
      productId: productId,
      large: names,
      small: type == "productImage" ? names : [],
      type: type,
    });
  } catch (error) {
    console.log("error");
    console.log(error);
    return failure(res, error.message, error);
  }
};

const FileUploadOfBaseData = async (data, path, name) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  const [, type] = data.split(";")[0].split("/");
  const base64Data = data.replace(/^data:image\/[a-z]+;base64,/, "");
  fs.writeFile(`${path}/${name}.${type}`, base64Data, "base64", (err) => {
    console.log(err);
  });
  // console.log(path)
  return `${path.split(".")[1]}/${name}.${type}`;
};

const FileUploadOfProductBaseData = async (data, path, name, type) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  const base64Data = data.replace(/^data:image\/[a-z]+;base64,/, "");
  fs.writeFile(`${path}/${name}.${type}`, base64Data, "base64", (err) => {
    console.log(err);
  });
  // console.log(path)
  return `${path.split(".")[1]}/${name}.${type}`;
};

const getBase64FromUrl = async (url) => {
  let data;
  await Axios.get(url, {
    responseType: "arraybuffer",
  }).then((response) => {
    data = Buffer.from(response.data, "binary").toString("base64");
  });
  return data;
};

const uploadFile = async (data, path, productId, index) => {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    const image = data;
    const extension = image.name.split(".")[1];
    const newName = productId + "_" + Date.now() + index + "." + extension;
    const uploadPath = path + newName;
    const moveFile = image.mv(uploadPath);
    if (moveFile) return path.split(".")[1] + newName;
  } catch (error) {
    if (error) return error;
  }
};

const Helper = {
  FileUpload,
  UniqueCode,
  uniqueId,
  fileUploaderForProduct,
  FileUploadOfBaseData,
  FileUploadOfProductBaseData,
  getBase64FromUrl,
  uploadFile,
};

module.exports = Helper;
