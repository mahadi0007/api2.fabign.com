const { isEmpty } = require("./helpers.validator");

const Store = (data) => {
  let error = {};

  if (!data.reason || isEmpty(data.reason)) error.module = "Reason is required";

  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

module.exports = {
  Store,
};
