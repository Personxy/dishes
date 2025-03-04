require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dishRoutes = require("./routes/dishRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 数据库连接
connectDB();

// 路由
app.use("/api/dishes", dishRoutes);
// 添加路由挂载
app.use("/api/categories", categoryRoutes);

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
