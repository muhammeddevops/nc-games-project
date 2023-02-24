const categories = require("../db/data/test-data/categories.js");
const { fetchReviews, fetchReviewsById } = require("../models/reviewsModel.js");

const getReviews = (request, response, next) => {
  const { sort_by, order_by, category } = request.query;

  fetchReviews(sort_by, order_by, category)
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

module.exports = { getReviews, getReviewsById };
