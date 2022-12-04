const route = require("express").Router();
// const ProductController = require("../controller/product");
const ProductControllerv2 = require("../controller/ProductV2");
//const { Admin } = require("../../common/middleware/Permission");
// const { Admin } = require("../../../api/middleware/permission.middleware");

// route.post('/v1/', Admin, ProductController.addNewProduct);
// route.post('/v2/create/', Admin, ProductControllerv2.addNewProduct);
route.get("/v2/get-all/", ProductControllerv2.getProduct);
route.get("/v2/single/:id", ProductControllerv2.getSignle);
// route.put('/v2/update/:id', Admin, ProductControllerv2.updateProduct);
// route.delete('/v2/remove/:id', Admin, ProductControllerv2.deleteProduct);
route.post("/v2/search/", ProductControllerv2.searchProduct);
route.post("/v2/filter/", ProductControllerv2.filterProduct);

// route.get('/', ProductController.getProduct);
// route.get('/single/:id', ProductController.getSignle);
route.get("/v2/cat/:id", ProductControllerv2.getProductByCategory);
// route.put('/update/:id', Admin, ProductController.updateProduct);
// route.delete('/remove/:id', Admin, ProductController.deleteProduct);
// route.post('/search/', ProductController.searchProduct );
// route.get('/filter/', ProductController.filterProduct);
module.exports = route;
