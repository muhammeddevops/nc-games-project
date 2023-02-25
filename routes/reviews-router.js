const {
  getReviews,
  getReviewsById,
  patchReviewVotesById,
  getCommentsOfReview,
  postComment,
} = require("../controllers/reviewsController");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/:review_id", getReviewsById);
reviewsRouter.patch("/:review_id", patchReviewVotesById);
reviewsRouter.get("/:review_id/comments", getCommentsOfReview);
reviewsRouter.post("/:review_id/comments", postComment);

module.exports = reviewsRouter;
