const BkashGateway = require("bkash-payment-gateway");

const bkashConfig = {
  baseURL: "https://checkout.sandbox.bka.sh/v1.2.0-beta", //do not add a trailing slash
  key: "5nej5keguopj928ekcj3dne8p",
  username: "testdemo",
  password: "test%#de23@msdao",
  secret: "1honf6u1c56mqcivtc9ffl960slp4v2756jle5925nbooa46ch62",
};

const bkash = new BkashGateway(bkashConfig);
module.exports = bkash;
