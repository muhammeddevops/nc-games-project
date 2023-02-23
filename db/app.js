const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const {
  getReviews,
  getReviewsById,
} = require("../controllers/reviewsController.js");
const {
  getCommentsOfReview,
} = require("../controllers/commentsControllers.js");

const {
  handle500Errors,
  handleWrongPathErrors,
  handleCustomErrors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getCommentsOfReview);

app.get("/api/reviews/:review_id", getReviewsById);

app.use(handleWrongPathErrors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
