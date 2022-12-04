const express = require("express");
const AuthRouter = express.Router();
const AdminController = require("../controllers/auth/admin.controller");

AuthRouter.post("/admin", AdminController.Login);

module.exports = { AuthRouter };
