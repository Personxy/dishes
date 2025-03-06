const NoteTemplate = require("../models/NoteTemplate");

// 创建备注模板
exports.createTemplate = async (req, res) => {
  try {
    const newTemplate = await NoteTemplate.create({
      user: req.user.id,
      content: req.body.content,
      isPublic: req.body.isPublic || false,
    });
    res.status(201).json({ success: true, data: newTemplate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 获取用户模板列表（包含公共模板）
exports.getUserTemplates = async (req, res) => {
  try {
    const templates = await NoteTemplate.find({
      $or: [{ user: req.user.id }, { isPublic: true }],
    }).sort("-usedCount");

    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 删除模板
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await NoteTemplate.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!template) throw new Error("模板不存在或无权删除");
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
