const axios = require('axios');
const redisClient = require('../config/redis');

// 发送短信验证码
exports.sendVerificationCode = async (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  await redisClient.setEx(`sms:${phone}`, 300, code); // 5分钟有效期
  
  // 调用第三方短信API（示例）
  return axios.post('https://sms-api.com/send', {
    phone,
    text: `您的验证码是：${code}，5分钟内有效`
  });
};

// 验证短信码
exports.verifyCode = async (phone, code) => {
  const storedCode = await redisClient.get(`sms:${phone}`);
  return storedCode === code;
};