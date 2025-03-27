const dishRoutes = require("./dishRoutes");
const categoryRoutes = require("./categoryRoutes");
const userRoutes = require("./userRoutes");
const orderRoutes = require("./orderRoutes");
const merchantOrderRoutes = require("./merchantOrderRoutes");
const noteTemplateRoutes = require("./noteTemplateRoutes");

module.exports = (app) => {
  app.use("/api/dishes", dishRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/merchant-orders", merchantOrderRoutes);
  app.use("/api/note-templates", noteTemplateRoutes);
};
