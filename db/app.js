const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const {
  getReviews,
  getReviewsById,
} = require("../controllers/reviewsController.js");
const { postComment } = require("../controllers/commentsControllers.js");
const {
  getCommentsOfReview,
} = require("../controllers/commentsControllers.js");
const {
  handle500Errors,
  handleWrongPathErrors,
  handleCustomErrors,
} = require("../controllers/errorHandlingControllers.js");
const { getUsers } = require("../controllers/usersControllers.js");

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewsById);

app.get("/api/reviews/:review_id/comments", getCommentsOfReview);

app.post("/api/reviews/:review_id/comments", postComment);

app.get("/api/users", getUsers);

app.use(handleWrongPathErrors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
