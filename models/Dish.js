const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "食材名称不能为空"]
  },
  amount: {
    type: Number,
    required: [true, "食材用量不能为空"]
  },
  unit: {
    type: String,
    enum: ["克", "千克", "毫升", "升", "勺", "茶匙", "汤匙", "杯", "个", "只", "条", "片", "根", "把", "束", "瓣", "适量"],
    required: [true, "食材单位不能为空"]
  }
});

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
  // 新增字段
  cookingTime: {
    type: Number,
    min: [1, "烹饪时间不能小于1分钟"],
    default: 30
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
    description: "烹饪难度，1-5星级"
  },
  ingredients: [ingredientSchema],
  cookingSteps: [{
    step: Number,
    description: String,
    image: String
  }],
  cookingTips: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Dish", dishSchema);
