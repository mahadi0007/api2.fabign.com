const express = require("express");
const AdminRouter = express.Router();
const DashboardController = require("../controllers/admin/dashboard.controller");
const AdminController = require("../controllers/admin/admin.controller");
const UserController = require("../controllers/admin/user.controller");
const SearchController = require("../controllers/admin/search.controller");
const TopbarController = require("../controllers/admin/topbar.controller");
const TopbarButtonController = require("../controllers/admin/topbar_button.controller");
const ECatergoryController = require("../controllers/admin/e_category.controller");
const ESubCatergoryController = require("../controllers/admin/e_sub_category.controller");
const EBrandController = require("../controllers/admin/e_brand.controller");
const EProductController = require("../controllers/admin/e_product.controller");
const ESliderController = require("../controllers/admin/e_slider.controller");
const EBannerController = require("../controllers/admin/e_banner.controller");
const EOrders = require("../controllers/admin/e_orders.controller");
const ERatingController = require("../controllers/admin/e_rating.controller");
const EFaqController = require("../controllers/admin/e_faq.controller");
const EAdditionalInfoController = require("../controllers/admin/e_additional_info.controller");
const VariationController = require("../controllers/admin/variation.controller");
const ShippingChargeController = require("../controllers/admin/shipping_charge.controller");
const ReportController = require("../controllers/admin/report.controller");
const StockManagementController = require("../controllers/admin/stock_management.controller");
const CouponManageController = require("../controllers/admin/coupon_management.controller");
const PathaoController = require("../controllers/web/pathao.controller");
const SMSTemplateController = require("../controllers/admin/sms-template.controller");
const StockHistoryController = require("../controllers/admin/stock_history.controller");
const StockReasonController = require("../controllers/admin/stock_reason.controller");

// Dashborad routes
AdminRouter.get("/dashboard", DashboardController.Index);

// Admin routes
AdminRouter.get("/admin", AdminController.Index);
AdminRouter.post("/admin", AdminController.Store);
AdminRouter.get("/admin/:id", AdminController.Show);
AdminRouter.put("/admin/:id", AdminController.Update);
AdminRouter.delete("/admin/:id", AdminController.Delete);

// User routes
AdminRouter.get("/user", UserController.Index);
AdminRouter.post("/user", UserController.Store);
AdminRouter.get("/user/:id", UserController.Show);
AdminRouter.put("/user/:id", UserController.Update);
AdminRouter.delete("/user/:id", UserController.Delete);

// Search routes
AdminRouter.get("/search/admin", SearchController.AdminSearch);
AdminRouter.get("/search/user", SearchController.UserSearch);

// Topbar router
AdminRouter.get("/topbar", TopbarController.Index);
AdminRouter.post("/topbar", TopbarController.Store);
AdminRouter.get("/topbar/:id", TopbarController.Show);
AdminRouter.put("/topbar/:id", TopbarController.Update);
AdminRouter.put("/topbar/makedefault/:id", TopbarController.MakeDefault);
AdminRouter.delete("/topbar/delete/:id", TopbarController.Delete);

// Topbar button router
AdminRouter.get("/topbar-button", TopbarButtonController.Index);
AdminRouter.put("/topbar-button/:id", TopbarButtonController.Update);

// E Category
AdminRouter.get("/e-category", ECatergoryController.Index);
AdminRouter.post("/e-category", ECatergoryController.Store);
AdminRouter.get("/e-category/:id", ECatergoryController.Show);
AdminRouter.put("/e-category/:id", ECatergoryController.Update);
AdminRouter.delete("/e-category/delete/:id", ECatergoryController.Delete);

// E Sub Category
AdminRouter.get("/e-sub-category", ESubCatergoryController.Index);
AdminRouter.post("/e-sub-category", ESubCatergoryController.Store);
AdminRouter.get("/e-sub-category/:id", ESubCatergoryController.Show);
AdminRouter.put("/e-sub-category/:id", ESubCatergoryController.Update);
AdminRouter.delete(
  "/e-sub-category/delete/:id",
  ESubCatergoryController.Delete
);

// E Brand
AdminRouter.get("/e-brand", EBrandController.Index);
AdminRouter.post("/e-brand", EBrandController.Store);
AdminRouter.get("/e-brand/:id", EBrandController.Show);
AdminRouter.put("/e-brand/:id", EBrandController.Update);
AdminRouter.delete("/e-brand/delete/:id", EBrandController.Delete);

// E Product
AdminRouter.get("/e-product", EProductController.Index);
AdminRouter.post("/e-product", EProductController.Store);
AdminRouter.get("/e-product/:id", EProductController.Show);
AdminRouter.put("/e-product/:id", EProductController.Update);
AdminRouter.delete("/e-product/delete/:id", EProductController.Delete);

// E Slider
AdminRouter.get("/e-slider", ESliderController.Index);
AdminRouter.post("/e-slider", ESliderController.Store);
AdminRouter.get("/e-slider/:id", ESliderController.Show);
AdminRouter.put("/e-slider/:id", ESliderController.Update);
AdminRouter.delete("/e-slider/delete/:id", ESliderController.Delete);

// E Banner
AdminRouter.get("/e-banner", EBannerController.Index);
AdminRouter.post("/e-banner", EBannerController.Store);
AdminRouter.get("/e-banner/:id", EBannerController.Show);
AdminRouter.put("/e-banner/:id", EBannerController.Update);
AdminRouter.delete("/e-banner/delete/:id", EBannerController.Delete);

// E Orders
AdminRouter.get("/e-orders", EOrders.Index);
AdminRouter.post("/e-orders", EOrders.Store);
AdminRouter.get("/e-orders/:id", EOrders.Show);
AdminRouter.put("/e-orders/:id", EOrders.Update);
AdminRouter.put("/e-orders/cancel-item/:id", EOrders.CancelItem);
AdminRouter.delete("/e-orders/delete/:id", EOrders.Delete);

// E Rating
AdminRouter.get("/e-rating", ERatingController.Index);
AdminRouter.get("/e-rating/:id", ERatingController.Show);
AdminRouter.put("/e-rating/:id", ERatingController.Update);
AdminRouter.delete("/e-rating/delete/:id/:productId", ERatingController.Delete);

// E FAQ Info
AdminRouter.get("/e-faq", EFaqController.Index);
AdminRouter.get("/e-faq/products", EFaqController.ProductWithFaq);
AdminRouter.post("/e-faq", EFaqController.Store);
AdminRouter.get("/e-faq/:id", EFaqController.Show);
AdminRouter.put("/e-faq/:id", EFaqController.Update);
AdminRouter.delete("/e-faq/delete/:id", EFaqController.Delete);

// E Additional Info
AdminRouter.get("/e-additional-info", EAdditionalInfoController.Index);
AdminRouter.get(
  "/e-additional-info/products",
  EAdditionalInfoController.ProductWithAdditionalInfo
);
AdminRouter.post("/e-additional-info", EAdditionalInfoController.Store);
AdminRouter.get("/e-additional-info/:id", EAdditionalInfoController.Show);
AdminRouter.put("/e-additional-info/:id", EAdditionalInfoController.Update);
AdminRouter.delete(
  "/e-additional-info/delete/:id",
  EAdditionalInfoController.Delete
);

// Variation
AdminRouter.get("/variation", VariationController.Index);
AdminRouter.post("/variation", VariationController.Store);
AdminRouter.get("/variation/:id", VariationController.Show);
AdminRouter.put("/variation/:id", VariationController.Update);
AdminRouter.delete("/variation/delete/:id", VariationController.Delete);

// Shipping Charge
AdminRouter.get("/shipping-charge", ShippingChargeController.Index);
AdminRouter.put("/shipping-charge", ShippingChargeController.Update);

// Report routes
AdminRouter.get("/report", ReportController.Index);

// Stock Management routes
AdminRouter.put("/stock-management", StockManagementController.Update);

// Coupon Management routes
AdminRouter.get("/coupon-management", CouponManageController.Index);
AdminRouter.post("/coupon-management", CouponManageController.Store);
AdminRouter.get("/coupon-management/:id", CouponManageController.Show);
AdminRouter.put("/coupon-management/:id", CouponManageController.Update);
AdminRouter.delete(
  "/coupon-management/delete/:id",
  CouponManageController.Delete
);

// Pathao routes
AdminRouter.post("/pathao-create-order", PathaoController.CreateOrder);

// SMS Template routes
AdminRouter.get(
  "/sms-template/get-template",
  SMSTemplateController.GetTemplate
);
AdminRouter.get("/sms-template", SMSTemplateController.Index);
AdminRouter.post("/sms-template", SMSTemplateController.Store);
AdminRouter.get("/sms-template/:id", SMSTemplateController.Show);
AdminRouter.put("/sms-template/:id", SMSTemplateController.Update);

// Stock History routes
AdminRouter.get("/stock-history/role", StockHistoryController.RoleIndex);
AdminRouter.get("/stock-history/:id", StockHistoryController.Index);

// Stock History routes
AdminRouter.get("/stock-reason", StockReasonController.Index);
AdminRouter.post("/stock-reason", StockReasonController.Store);

module.exports = { AdminRouter };
