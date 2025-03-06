const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
        required: true,
      },
      image: String,
      name: String, // 菜品快照
      price: Number, // 下单时价格
      quantity: {
        type: Number,
        min: 1,
        default: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  remark: String,
  scheduledTime: {
    type: Date,
    required: [true, "预约时间不能为空"],
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "canceled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 预约时间验证中间件
orderSchema.pre("save", function (next) {
  if (this.scheduledTime < Date.now()) {
    next(new Error("预约时间不能早于当前时间"));
  } else {
    next();
  }
});

module.exports = mongoose.model("Order", orderSchema);
