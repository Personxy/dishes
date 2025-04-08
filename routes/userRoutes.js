const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/wechatLogin", userController.wechatLogin);

// 邮箱验证和密码重置路由
router.get("/verify-email/:token", userController.verifyEmail);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

// 需要认证的路由
router.post("/updateProfile", auth, userController.updateUserInfo);
router.post("/upload-avatar", auth, userController.uploadAvatar);
// 添加获取当前用户信息的接口
router.get("/getProfile", auth, userController.getCurrentUser);

// 添加邮箱验证码发送路由
router.post("/send-email-code", userController.sendEmailVerificationCode);

module.exports = router;
