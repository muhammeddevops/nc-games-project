const { request, response } = require("../db/app.js");
const {
  fetchReviews,
  fetchReviewsById,
  updateReviewVotesById,
} = require("../models/reviewsModel.js");

const getReviews = (request, response, next) => {
  fetchReviews()
    .then((reviews) => {
      response.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviewsById = (request, response, next) => {
  const { review_id } = request.params;

  fetchReviewsById(review_id)
    .then((review) => {
      response.status(200).send(review);
    })
    .catch((error) => {
      next(error);
    });
};

const patchReviewVotesById = (request, response, next) => {
  const { review_id } = request.params;
  const { inc_votes } = request.body;

  updateReviewVotesById(review_id, inc_votes)
    .then((updatedReview) => {
      response.status(200).send(updatedReview);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getReviews, getReviewsById, patchReviewVotesById };
