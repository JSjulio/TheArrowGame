const router = require("express").Router();

router.use("/game", require("./game"));

module.exports = router;
