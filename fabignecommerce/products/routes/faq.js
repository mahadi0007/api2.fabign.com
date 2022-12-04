const route = require("express").Router();
const { Admin } = require("../../../api/middleware/permission.middleware");
const FAQController = require("../controller/faq");

// routers for FAQ Section
// route.post('/faq', Admin, FAQController.addFaq);
// route.get('/faq/getall', FAQController.getAllFaq);
route.get("/faq/getProductWise/:id", FAQController.getProductWise);
// route.get('/faq/getSingle/:id', FAQController.getSingleFaq);
// route.put('/faq/edit/:id', Admin, FAQController.editFaq);
// route.delete('/faq/delete/:id', Admin, FAQController.deleteFaq);
// route.get('/faq/products/', FAQController.getProductwithFaq)

module.exports = route;
