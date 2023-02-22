const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const { getReviews } = require("../controllers/reviewsController.js");
const {
  getCommentsOfReview,
} = require("../controllers/commentsControllers.js");

const {
  handle404Errors,
  handle500Errors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getCommentsOfReview);

app.use(handle404Errors);

app.use(handle500Errors);

module.exports = app;
