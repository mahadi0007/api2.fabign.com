const { isEmpty } = require("./helpers.validator");

const Store = (data) => {
  let error = {};

  if (!data.title || isEmpty(data.title)) error.title = "Title is required";
  // if (!data.description || isEmpty(data.description)) error.description = "Description is required"

  if (!data.files) {
    error.title_image = "Title image is required";
    error.main_image = "Main image is required";
  }

  if (data.files) {
    if (!data.files.title_image || isEmpty(data.files.title_image))
      error.title_image = "Title image is required";
    if (!data.files.main_image || isEmpty(data.files.main_image))
      error.main_image = "Main image is required";
  }

  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

module.exports = {
  Store,
};
