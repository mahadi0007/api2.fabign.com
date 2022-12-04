const route = require("express").Router();
// const { Admin } = require("../../../api/middleware/permission.middleware")
const AdditionalInfoController = require("../controller/AdditionalInfo");

// routers for FAQ Section
// route.post('/additionalinfo', Admin, AdditionalInfoController.addAdditionalInfo);
// route.get('/additionalinfo/getall', AdditionalInfoController.getAllAdditionalInfo);
route.get(
  "/additionalinfo/getProductWise/:id",
  AdditionalInfoController.getProductWise
);
// route.get('/additionalinfo/getSingle/:id', AdditionalInfoController.getSingleAdditionalInfo);
// route.put('/additionalinfo/edit/:id', Admin, AdditionalInfoController.editAdditionInfo);
// route.delete('/additionalinfo/delete/:id', Admin, AdditionalInfoController.deleteAdditionalInfo);
// route.get('/additionalinfo/products/', AdditionalInfoController.getProductwithAdditionalInfo)

module.exports = route;
