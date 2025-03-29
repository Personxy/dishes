const express = require("express");
const router = express.Router();
const dishController = require("../controllers/dishController");
const auth = require("../middlewares/auth");


router.get("/",auth, dishController.getAllDishes);
router.post("/", auth, dishController.createDish);
router.put("/:id", auth, dishController.updateDish);
router.delete("/:id", auth, dishController.deleteDish);

module.exports = router;
