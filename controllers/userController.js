const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendVerificationCode, verifyCode } = require("../utils/smsSender");
const axios = require("axios");
// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    const user = await User.create({ username, password, phone });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        error: "用户名或密码错误",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// 发送短信验证码
exports.sendSmsCode = async (req, res) => {
  try {
    await sendVerificationCode(req.body.phone);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "短信发送失败" });
  }
};

// 短信验证码登录
exports.loginWithSms = async (req, res) => {
  const isValid = await verifyCode(req.body.phone, req.body.code);
  if (!isValid) return res.status(401).json({ error: "验证码错误" });

  const user = await User.findOne({ phone: req.body.phone });
  if (!user) {
    // 可选：自动创建用户
    user = await User.create({ phone: req.body.phone });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
};
exports.wechatLogin = async (req, res) => {
  const { code } = req.body;
  const response = await axios.get(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APPID}&secret=${process.env.WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`
  );

  const { openid, unionid } = response.data;
  let user = await User.findOne({ "wechat.openid": openid });

  if (!user) {
    user = await User.create({
      wechat: { openid, unionid },
      username: `wx_${openid.slice(-6)}`,
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
};
