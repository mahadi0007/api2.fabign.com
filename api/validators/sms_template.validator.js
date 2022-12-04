const { isEmpty } = require("./helpers.validator");

const Store = (data) => {
  let error = {};

  if (!data.module || isEmpty(data.module)) error.module = "Module is required";
  if (!data.type || isEmpty(data.type)) error.type = "Type is required";
  if (!data.status || isEmpty(data.status)) error.status = "Status is required";
  if (!data.sms || isEmpty(data.sms)) error.sms = "SMS Template is required";

  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

module.exports = {
  Store,
};
