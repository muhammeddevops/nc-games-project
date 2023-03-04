const {
  getCategories,
  postCategory,
} = require("../controllers/categoriesController.js");

const categoriesRouter = require("express").Router();

categoriesRouter.get("/", getCategories);
categoriesRouter.post("/", postCategory);

module.exports = categoriesRouter;
