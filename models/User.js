const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "用户名不能为空"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "密码不能为空"],
    minlength: 6,
  },
  phone: {
    type: String,
    required: [true, "手机号不能为空"],
    match: [/^1[3-9]\d{9}$/, "手机号格式不正确"],
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
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
