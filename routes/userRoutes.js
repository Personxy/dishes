const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/wechatLogin", userController.wechatLogin);

// 需要认证的路由
router.post("/updateProfile", auth, userController.updateUserInfo);
router.post("/upload-avatar", auth, userController.uploadAvatar);
// 添加获取当前用户信息的接口
router.get("/getProfile", auth, userController.getCurrentUser);

module.exports = router;
