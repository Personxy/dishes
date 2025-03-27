require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const setupRoutes = require("./routes");

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 数据库连接
connectDB();

// 路由
setupRoutes(app);

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
