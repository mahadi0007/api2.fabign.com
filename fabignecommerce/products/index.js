const productRouter = require("express").Router();
const categoryRoute = require("./routes/category");
const brandRoute = require("./routes/brand");
const variationRoute = require('./routes/variation');
const subCategoryRoute = require('./routes/subcategory');
const ratingRoute = require("./routes/rating");
const faqRoute = require("./routes/faq")
const additionalInfoRoute = require("./routes/additionInfo")

productRouter.use("/", categoryRoute);
productRouter.use("/", require("./routes/product"));
productRouter.use("/", brandRoute);
productRouter.use("/", variationRoute);
productRouter.use("/", subCategoryRoute);
productRouter.use("/", ratingRoute);
productRouter.use("/", faqRoute);
productRouter.use("/", additionalInfoRoute);
module.exports = productRouter;