const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const {
  getReviews,
  getReviewsById,
} = require("../controllers/reviewsController.js");
const { postComment } = require("../controllers/commentsControllers.js");
const {
  handle404Errors,
  handle500Errors,
  handleWrongPathErrors,
  handle400Errors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewsById);

app.post("/api/reviews/:review_id/comments", postComment);

app.use(handle400Errors);
app.use(handleWrongPathErrors);
app.use(handle404Errors);
app.use(handle500Errors);

module.exports = app;
