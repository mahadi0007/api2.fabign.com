const express = require("express")
const AclRouter = express.Router()
const RoleController = require("../controllers/acl/role.controller")
const RouteController = require("../controllers/acl/route.controller")

// Role routes
AclRouter.get("/role", RoleController.Index)
AclRouter.post("/role", RoleController.Store)
AclRouter.get("/role/:id", RoleController.Show)
AclRouter.put("/role/:id", RoleController.Update)
AclRouter.delete("/role/:id", RoleController.Delete)

// Route paths
AclRouter.get("/role/route/paths", RouteController.Index)

module.exports = { AclRouter }