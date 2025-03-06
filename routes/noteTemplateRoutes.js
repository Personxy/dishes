const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const templateController = require("../controllers/noteTemplateController");

router.use(auth);

router.post("/", templateController.createTemplate);
router.get("/", templateController.getUserTemplates);
router.delete("/:id", templateController.deleteTemplate);

module.exports = router;
