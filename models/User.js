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
      // 如果是微信登录用户（有wechat.openid）则不要求手机号
      return !this.wechat || !this.wechat.openid;
    },
    match: [/^1[3-9]\d{9}$/, "手机号格式不正确"],
  },
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

module.exports = mongoose.model("User", userSchema);
