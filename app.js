require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // 添加 path 模块导入
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const setupRoutes = require("./routes");

const app = express();

// 中间件
app.use(express.json());
app.use(cors());
// 在现有中间件配置后添加
app.use(express.static(path.join(__dirname, 'public')));

// 数据库连接
connectDB();

// 路由
setupRoutes(app);

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
