const express = require("express");
const router = express.Router();
const { AuthRouter } = require("./auth.route");
const { AclRouter } = require("./acl.route");
const { AdminRouter } = require("./admin.route");
const { WebRouter } = require("./web.route");
const Permission = require("../middleware/permission.middleware");

router.use("/auth", AuthRouter);
router.use("/acl", Permission.Admin, AclRouter);
router.use("/admin", Permission.Admin, AdminRouter);
router.use("/web", WebRouter);

module.exports = router;
