const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const { getReviews } = require("../controllers/reviewsController.js");
const {
  getCommentsOfReview,
} = require("../controllers/commentsControllers.js");

const {
  handle404Errors,
  handle500Errors,
  handleWrongPathErrors,
  handle400Errors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getCommentsOfReview);

app.use(handleWrongPathErrors);
app.use(handle404Errors);
app.use(handle400Errors);
app.use(handle500Errors);

module.exports = app;
