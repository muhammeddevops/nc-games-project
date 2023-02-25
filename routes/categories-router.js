const { getCategories } = require("../controllers/categoriesController.js");

const categoriesRouter = require("express").Router();

categoriesRouter.get("/", getCategories);

module.exports = categoriesRouter;
