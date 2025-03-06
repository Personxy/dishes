const Order = require("../models/Order");
const Dish = require("../models/Dish");
const NoteTemplate = require("../models/NoteTemplate");
// 创建订单
exports.createOrder = async (req, res) => {
  try {
    const { items, scheduledTime, templateId, customRemark } = req.body;

    // 处理备注逻辑
    let remark = "";
    if (templateId) {
      const template = await NoteTemplate.findOne({
        _id: templateId,
        $or: [{ user: req.user.id }, { isPublic: true }],
      });
      if (!template) throw new Error("备注模板不可用");
      remark = template.content;
      await NoteTemplate.updateOne({ _id: templateId }, { $inc: { usedCount: 1 } });
    } else if (customRemark) {
      remark = customRemark;
    }

    // 获取菜品信息（保持原逻辑）
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const dish = await Dish.findById(item.dish);
        return {
          dish: dish._id,
          name: dish.name,
          price: dish.price,
          quantity: item.quantity,
          image: dish.image,
        };
      })
    );

    // 创建订单（保持原逻辑）
    const newOrder = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      remark,
      scheduledTime,
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 获取用户订单列表
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt").populate("user", "username phone");

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// 商家修改订单状态
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: "订单不存在" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (!order) return res.status(400).json({ error: "订单无法取消" });

    order.status = "canceled";
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
