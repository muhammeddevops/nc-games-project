const {
  getReviews,
  getReviewsById,
  patchReviewVotesById,
  getCommentsOfReview,
  postComment,
  postReview,
  deleteReviewById,
} = require("../controllers/reviewsController");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/:review_id", getReviewsById);
reviewsRouter.patch("/:review_id", patchReviewVotesById);
reviewsRouter.get("/:review_id/comments", getCommentsOfReview);
reviewsRouter.post("/:review_id/comments", postComment);
reviewsRouter.post("/", postReview);
reviewsRouter.delete("/:review_id", deleteReviewById);

module.exports = reviewsRouter;
