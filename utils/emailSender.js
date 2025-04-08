const nodemailer = require("nodemailer");
const User = require("../models/User");

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true, // 使用SSL
  auth: {
    user: process.env.EMAIL_USERNAME, // 您的QQ邮箱
    pass: process.env.EMAIL_PASSWORD, // 您的QQ邮箱授权码，不是QQ密码
  },
});

// 生成随机验证码
const generateVerificationCode = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 检查邮箱注册限制
const checkEmailRegistrationLimit = async () => {
  // 获取今天的开始时间
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 获取今天注册的邮箱用户数量
  const count = await User.countDocuments({
    email: { $exists: true },
    createdAt: { $gte: today },
  });

  // 如果超过5个，返回false
  return count < 5;
};

// 验证邮箱格式
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 检查发送频率
const checkSendFrequency = async (email) => {
  const user = await User.findOne({
    email,
    emailVerificationCodeExpires: { $gt: Date.now() },
  });

  if (user && user.emailVerificationCodeExpires) {
    // 计算验证码创建时间（假设验证码有效期为10分钟）
    const codeCreationTime = new Date(user.emailVerificationCodeExpires.getTime() - 10 * 60 * 1000);

    // 计算从创建时间到现在经过了多少秒
    const elapsedSeconds = Math.floor((Date.now() - codeCreationTime.getTime()) / 1000);

    // 如果验证码是在1分钟内创建的，限制再次发送
    if (elapsedSeconds < 60) {
      const remainingTime = 60 - elapsedSeconds;
      return {
        canSend: false,
        remainingTime,
      };
    }
  }

  return {
    canSend: true,
    remainingTime: 0,
  };
};

// 发送邮箱验证码
const sendEmailVerificationCode = async (email) => {
  // 验证邮箱格式
  if (!validateEmail(email)) {
    return {
      success: false,
      error: "邮箱格式不正确",
    };
  }

  // 检查邮箱是否已被注册
  const existingUser = await User.findOne({
    email,
    emailVerified: true,
    username: { $exists: true },
    password: { $exists: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "该邮箱已被注册",
    };
  }

  // 检查发送频率
  const frequencyCheck = await checkSendFrequency(email);
  if (!frequencyCheck.canSend) {
    return {
      success: false,
      error: `请等待${frequencyCheck.remainingTime}秒后再尝试发送`,
      remainingTime: frequencyCheck.remainingTime,
    };
  }

  // 检查邮箱注册限制
  const canRegister = await checkEmailRegistrationLimit();
  if (!canRegister) {
    return {
      success: false,
      error: "今日邮箱注册数量已达上限，请明天再试",
    };
  }

  // 生成验证码
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

  // 存储验证码
  await User.findOneAndUpdate(
    { email },
    {
      email,
      emailVerificationCode: verificationCode,
      emailVerificationCodeExpires: verificationCodeExpires,
      emailVerified: false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: false }
  );

  // 发送验证邮件
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "您的邮箱验证码",
    html: `
      <h1>邮箱验证码</h1>
      <p>您好！</p>
      <p>您的验证码是：</p>
      <h2 style="color: #4285f4; font-size: 24px; letter-spacing: 5px; padding: 10px; background-color: #f5f5f5; display: inline-block;">${verificationCode}</h2>
      <p>此验证码10分钟内有效。</p>
      <p>如果您没有注册我们的服务，请忽略此邮件。</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  return {
    success: true,
    message: "验证码已发送，请查收邮件",
  };
};

module.exports = {
  sendEmailVerificationCode,
  validateEmail,
};
