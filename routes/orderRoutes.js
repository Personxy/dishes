const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const orderController = require("../controllers/orderController");

router.use(auth); // 所有订单接口需要认证

router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.delete("/:id", orderController.cancelOrder);
module.exports = router;
