require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dishRoutes = require("./routes/dishRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 数据库连接
connectDB();

// 路由
app.use("/api/dishes", dishRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
