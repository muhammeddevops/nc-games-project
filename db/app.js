const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const {
  getReviews,
  getReviewsById,
} = require("../controllers/reviewsController.js");
const {
  handle404Errors,
  handle500Errors,
  handleWrongPathErrors,
  handle400Errors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewsById);

app.use(handleWrongPathErrors);
app.use(handle404Errors);
app.use(handle500Errors);
app.use(handle400Errors);

module.exports = app;
