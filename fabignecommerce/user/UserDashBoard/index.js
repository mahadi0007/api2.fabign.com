const router = require("express").Router();
const historyRouter = require("./routes/history");

router.use("/purchase/", historyRouter);
module.exports = router;
