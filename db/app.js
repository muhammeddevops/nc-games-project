const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const { getReviews } = require("../controllers/reviewsController.js");
const {
  handle404Errors,
  handle500Errors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.use(handle404Errors);

app.use(handle500Errors);

module.exports = app;
