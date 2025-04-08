const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "用户名不能为空"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      // 如果是微信登录用户（有wechat.openid）则不要求密码
      return !this.wechat || !this.wechat.openid;
    },
    minlength: 6,
  },
  phone: {
    type: String,
    required: function() {
      // 如果是微信登录用户或邮箱用户则不要求手机号
      return !this.wechat?.openid && !this.email;
    },
    match: [/^1[3-9]\d{9}$/, "手机号格式不正确"],
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "邮箱格式不正确"],
    unique: true,
    sparse: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // 添加邮箱验证码相关字段
  emailVerificationCode: String,
  emailVerificationCodeExpires: Date,
  // 原有字段
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // 添加密码重置验证码相关字段
  resetPasswordCode: String,
  resetPasswordCodeExpires: Date,
  avatar: {
    type: String,
    default: "default-avatar.png"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["user", "admin", "merchant"],
    default: "user",
  },
  wechat: {
    openid: { type: String, unique: true, sparse: true },
    unionid: String,
    nickname: String,
    avatar: String,
  },
});

// 密码加密中间件
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
