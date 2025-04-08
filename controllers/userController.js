const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendVerificationCode, verifyCode } = require("../utils/smsSender");
const { sendEmailVerificationCode } = require("../utils/emailSender");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// 生成随机令牌
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// 发送邮箱验证码
exports.sendEmailVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "请提供邮箱地址",
      });
    }

    const result = await sendEmailVerificationCode(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        remainingTime: result.remainingTime,
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, phone, email, verificationCode } = req.body;

    // 如果提供了邮箱，验证验证码
    if (email) {
      // 查找验证码记录
      const verificationRecord = await User.findOne({
        email,
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpires: { $gt: Date.now() },
      });

      if (!verificationRecord) {
        return res.status(400).json({
          success: false,
          error: "验证码无效或已过期",
        });
      }

      // 检查邮箱是否已被正式注册
      const existingUser = await User.findOne({
        email,
        emailVerified: true,
        username: { $exists: true },
        password: { $exists: true },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "该邮箱已被注册",
        });
      }

      // 创建或更新用户
      const user = await User.findOneAndUpdate(
        { email },
        {
          username,
          password,
          phone: phone || undefined,
          emailVerified: true,
          emailVerificationCode: undefined,
          emailVerificationCodeExpires: undefined,
        },
        { new: true, runValidators: true }
      );

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        success: true,
        message: "注册成功",
        token,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      });
    } else {
      // 原有的手机号注册逻辑
      const user = await User.create({ username, password, phone });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(201).json({
        success: true,
        message: "注册成功",
        token,
        data: user,
      });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 根据用户名或邮箱查找用户
    let user;
    if (email) {
      user = await User.findOne({ email }).select("+password");

      // 检查邮箱是否已验证
      if (user && !user.emailVerified) {
        return res.status(401).json({
          success: false,
          error: "邮箱未验证，请先验证邮箱",
        });
      }
    } else {
      user = await User.findOne({ username }).select("+password");
    }

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

// 验证邮箱
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "验证链接无效或已过期",
      });
    }

    // 更新用户信息
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "邮箱验证成功，现在可以登录了",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 忘记密码
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "该邮箱未注册",
      });
    }

    // 生成重置令牌
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小时后过期

    // 更新用户信息
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // 发送重置密码邮件
    const resetUrl = `http://${req.get("host")}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "重置密码",
      html: `
        <h1>重置密码</h1>
        <p>您好，${user.username}！</p>
        <p>您请求重置密码，请点击下面的链接：</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>此链接1小时内有效。如果您没有请求重置密码，请忽略此邮件。</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "重置密码邮件已发送，请查收",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "重置链接无效或已过期",
      });
    }

    // 更新密码
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "密码重置成功，请使用新密码登录",
    });
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
    const allowedFields = ["username", "phone", "avatar", "email"];
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

    // 如果尝试更新邮箱，需要重新验证
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "邮箱已被占用",
        });
      }

      // 生成新的验证令牌
      const verificationToken = generateToken();
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      updateData.verificationToken = verificationToken;
      updateData.verificationTokenExpires = verificationTokenExpires;
      updateData.emailVerified = false;

      // 发送验证邮件
      const verificationUrl = `http://${req.get("host")}/api/users/verify-email/${verificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: updateData.email,
        subject: "请验证您的邮箱",
        html: `
          <h1>邮箱验证</h1>
          <p>您好！</p>
          <p>请点击下面的链接验证您的邮箱：</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>此链接24小时内有效。</p>
        `,
      };

      await transporter.sendMail(mailOptions);
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
