const Category = require("../models/Category");
const Dish = require("../models/Dish");
const mongoose = require("mongoose");
const _ = require("lodash"); // 用于筛选字段
// 获取所有分类（按排序值倒序）
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 创建分类
exports.createCategory = async (req, res) => {
  try {
    // 允许的字段，防止传入不必要的参数
    const allowedFields = ["name", "description", "sortOrder", "isActive"];
    const categoryData = _.pick(req.body, allowedFields);

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ name: categoryData.name });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        code: 409,
        error: {
          message: "分类名称已存在",
          details: { name: "分类名称不能重复" },
        },
      });
    }

    // 创建新分类
    const newCategory = new Category(categoryData);
    const savedCategory = await newCategory.save();

    // console.log("创建成功:", savedCategory);

    res.status(200).json({
      success: true,
      code: 200,
      message: "分类创建成功",
      data: savedCategory,
    });
  } catch (err) {
    console.error("创建分类出错:", err);

    // 处理 Mongoose 验证错误
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        code: 400,
        error: {
          message: "数据验证失败",
          details: err.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      code: 500,
      error: {
        message: "服务器内部错误",
      },
    });
  }
};

// 更新分类
exports.updateCategory = async (req, res) => {
  try {
    // 1. 检查 id 是否有效
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "无效的分类 ID" });
    }

    // 2. 过滤允许更新的字段，防止非法字段更新
    const allowedUpdates = ["name", "description", "sortOrder", "isActive"];
    // console.log("请求体数据:", req.body);
    const updateData = _.pick(req.body, allowedUpdates);

    // 3. 执行更新
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // 返回更新后的文档
      runValidators: true, // 运行 Schema 验证
    });

    if (!category) {
      return res.status(404).json({ success: false, error: "分类未找到" });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    console.error(err);

    // 4. 细化错误信息
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: "数据验证失败", details: err.errors });
    }

    res.status(500).json({ success: false, error: "服务器错误" });
  }
};

// 删除分类（带安全检查）
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // 检查 ID 格式是否正确
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        code: 400,
        error: {
          message: "无效的分类 ID",
          details: { id: "提供的 ID 格式不正确" },
        },
      });
    }

    // 检查分类是否存在
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        code: 404,
        error: {
          message: "分类未找到",
          details: { id: "该分类 ID 不存在" },
        },
      });
    }

    // 检查是否有关联菜品
    const dishCount = await Dish.countDocuments({ category: categoryId });
    if (dishCount > 0) {
      return res.status(400).json({
        success: false,
        code: 400,
        error: {
          message: "该分类下存在菜品，不可删除",
          details: { associatedDishes: dishCount },
        },
      });
    }

    // 删除分类
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      code: 200,
      message: "分类删除成功",
    });
  } catch (err) {
    console.error("删除分类出错:", err);

    res.status(500).json({
      success: false,
      code: 500,
      error: {
        message: "服务器内部错误",
        details: err.message,
      },
    });
  }
};
