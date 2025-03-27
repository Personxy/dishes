const express = require("express");
const router = express.Router();
const merchantAuth = require("../middlewares/merchantAuth");
const orderController = require("../controllers/orderController");

router.patch("/:id/status", merchantAuth, orderController.updateOrderStatus);
module.exports = router;
