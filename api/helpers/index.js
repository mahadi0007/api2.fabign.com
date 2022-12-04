const fs = require("fs");
const slugify = require("slugify");

// Custom slug generator
const CustomSlug = (data) => {
  let newSlug = slugify(data, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: /[`/|*+~.()'"!:@]/g, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    locale: "vi", // language code of the locale to use
  });
  newSlug = newSlug + "-" + Date.now();
  return newSlug;
};

// Host URL from server
const HostURL = (req) => {
  // return "http://" + req.headers.host + "/";
  return "https://api.efgtailor.com/";
};

// Single file upload
const UploadFile = async (data, path) => {
  try {
    const image = data;
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    const newName = Date.now() + ".png";
    uploadPath = path + newName;
    const moveFile = image.mv(uploadPath);

    if (moveFile) return newName;
  } catch (error) {
    if (error) return error;
  }
};

// Extract route group name
const RouteGroupName = (path) => {
  return path.replace(/\//g, " ").split(" ")[1];
};

const IsValidURL = (string) => {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
};

module.exports = {
  CustomSlug,
  HostURL,
  UploadFile,
  RouteGroupName,
  IsValidURL,
};
