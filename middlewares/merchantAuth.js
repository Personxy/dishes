const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "未授权" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "merchant") throw new Error();
    req.merchant = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "商家权限不足" });
  }
};
