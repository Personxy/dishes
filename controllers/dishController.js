const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const Category = require("../models/Category");

// 获取所有菜品
exports.getAllDishes = async (req, res) => {
  try {
    // 使用populate关联分类数据
    const dishes = await Dish.find().populate("category", "name description");
    res.json({ success: true, data: dishes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 在创建菜品时增加分类存在性校验
exports.createDish = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    // console.log(name, category, "ns");

    // 统一错误响应方法
    const errorResponse = (statusCode, message, details = {}) => {
      return res.status(statusCode).json({
        success: false,
        statusCode,
        error: { message, details },
      });
    };

    // 确保必填字段存在
    if (!name || !category) {
      return errorResponse(400, "缺少必要字段", { requiredFields: ["name", "category"] });
    }

    // 检查 category 是否是合法的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return errorResponse(400, "无效的分类 ID", { category });
    }

    // 确保分类存在
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return errorResponse(400, "指定分类不存在", { category });
    }

    // 检查同一分类下是否已有相同名称的菜品
    const existingDish = await Dish.findOne({ name, category });
    if (existingDish) {
      return errorResponse(400, "该分类下已存在相同名称的菜品", { existingDish });
    }

    // 创建新菜品
    const newDish = new Dish(req.body);
    const savedDish = await newDish.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "菜品创建成功",
      data: savedDish,
    });
  } catch (err) {
    console.error("创建菜品出错:", err);

    res.status(500).json({
      success: false,
      statusCode: 500,
      error: {
        message: "服务器内部错误",
        details: err.message,
      },
    });
  }
};

// 更新菜品
exports.updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    // 统一错误响应方法
    const errorResponse = (statusCode, message, details = {}) => {
      return res.status(statusCode).json({
        success: false,
        statusCode,
        error: { message, details },
      });
    };

    // 校验 ID 是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(400, "无效的菜品 ID", { id });
    }

    // 查找菜品是否存在
    const existingDish = await Dish.findById(id);
    if (!existingDish) {
      return errorResponse(404, "菜品未找到", { id });
    }

    // 校验 category 是否是合法 ObjectId 并且是否存在
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return errorResponse(400, "无效的分类 ID", { category });
      }

      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return errorResponse(400, "指定分类不存在", { category });
      }
    }

    // 校验是否有同名菜品（同分类下）
    if (name && category) {
      const duplicateDish = await Dish.findOne({ name, category, _id: { $ne: id } });
      if (duplicateDish) {
        return errorResponse(400, "该分类下已存在相同名称的菜品", { existingDish: duplicateDish });
      }
    }

    // 更新菜品
    const updatedDish = await Dish.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "菜品更新成功",
      data: updatedDish,
    });
  } catch (err) {
    console.error("更新菜品出错:", err);

    res.status(500).json({
      success: false,
      statusCode: 500,
      error: {
        message: "服务器内部错误",
        details: err.message,
      },
    });
  }
};

// 删除菜品
exports.deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    // 统一错误响应方法
    const errorResponse = (statusCode, message, details = {}) => {
      return res.status(statusCode).json({
        success: false,
        statusCode,
        error: { message, details },
      });
    };

    // 校验 ID 是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(400, "无效的菜品 ID", { id });
    }

    // 查找菜品是否存在
    const dish = await Dish.findById(id);
    if (!dish) {
      return errorResponse(404, "菜品未找到", { id });
    }

    // 执行删除
    await Dish.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "菜品删除成功",
      data: {},
    });
  } catch (err) {
    console.error("删除菜品出错:", err);

    res.status(500).json({
      success: false,
      statusCode: 500,
      error: {
        message: "服务器内部错误",
        details: err.message,
      },
    });
  }
};
