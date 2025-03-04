const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "菜品名称不能为空"],
    trim: true,
  },
  // price: {
  //   type: Number,
  //   required: true,
  //   min: [0, "价格不能为负数"],
  // },
  description: {
    type: String,
    default: "",
  },
  image: String,
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // 修改为引用类型
    ref: "Category",
    required: [true, "必须选择分类"],
  },
});

module.exports = mongoose.model("Dish", dishSchema);
