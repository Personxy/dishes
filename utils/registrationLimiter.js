const User = require('../models/User');

// 检查邮箱注册限制
exports.checkEmailRegistrationLimit = async () => {
  // 获取今天的开始时间
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 获取今天注册的邮箱用户数量
  const count = await User.countDocuments({
    email: { $exists: true },
    createdAt: { $gte: today }
  });
  
  // 如果超过5个，返回false
  return count < 5;
};