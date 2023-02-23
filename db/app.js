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
  handle404Errors,
  handle500Errors,
  handleWrongPathErrors,
  handle400Errors,
} = require("../controllers/errorHandlingControllers.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

<<<<<<< HEAD
app.get("/api/reviews/:review_id/comments", getCommentsOfReview);

app.use(handleWrongPathErrors);
app.use(handle404Errors);
app.use(handle400Errors);
=======
app.get("/api/reviews/:review_id", getReviewsById);

app.use(handle400Errors);
app.use(handleWrongPathErrors);
app.use(handle404Errors);
>>>>>>> 5e35f7160bfbecb54d496077307a7896754b9925
app.use(handle500Errors);

module.exports = app;
