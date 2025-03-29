const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendVerificationCode, verifyCode } = require("../utils/smsSender");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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
  try {
    const { code } = req.body;
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APPID}&secret=${process.env.WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`
    );

    const { openid, unionid } = response.data;
    let user = await User.findOne({ "wechat.openid": openid });

    // 判断是否为新用户
    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        wechat: { openid, unionid },
        username: `wx_${openid.slice(-6)}`,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token, isNewUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    const allowedFields = ["username", "phone", "avatar"];
    const updateData = {};

    // 只允许更新特定字段
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // 如果尝试更新用户名，需要检查唯一性
    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: req.user.id }, // 排除当前用户
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "用户名已被占用",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "用户不存在" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads/avatars");
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

// 文件过滤器，只允许图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
  },
});

// 上传头像处理函数
exports.uploadAvatar = [
  upload.single("avatar"), // 'avatar' 是表单字段名
  async (req, res) => {
    try {
      let avatarUrl;
      // 判断是文件上传还是微信头像URL
      if (req.file) {
        // 本地文件上传
        // 修改返回的URL路径，确保前端可以访问
        avatarUrl = `${process.env.BASE_URL}/uploads/avatars/${req.file.filename}`;
      } else if (req.body.wechatAvatarUrl) {
        // 微信头像URL
        const wechatAvatarUrl = req.body.wechatAvatarUrl;

        // 下载微信头像
        const response = await axios({
          method: "get",
          url: wechatAvatarUrl,
          responseType: "arraybuffer",
        });

        // 生成文件名和保存路径
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = `avatar-wx-${uniqueSuffix}.jpg`;
        const uploadDir = path.join(__dirname, "../public/uploads/avatars");

        // 确保目录存在
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 保存文件
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, response.data);

        // 修改返回的URL路径，确保前端可以访问
        avatarUrl = `${process.env.BASE_URL}/uploads/avatars/${fileName}`;
      } else {
        return res.status(400).json({ success: false, error: "请提供头像文件或微信头像URL" });
      }

      // 更新用户头像
      const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true });

      res.json({
        success: true,
        data: {
          avatar: avatarUrl,
          user: user,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
];
// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "用户不存在",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
