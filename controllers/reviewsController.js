const { request, response } = require("../db/app.js");
const { fetchCategory } = require("../models/categoriesModel.js");
const {
  fetchReviews,
  fetchReviewsById,
  updateReviewVotesById,
} = require("../models/reviewsModel.js");

const getReviews = (request, response, next) => {
  const { sort_by, order_by, category } = request.query;
  const promiseArr = [];

  const fetchReviewPromise = fetchReviews(sort_by, order_by, category);
  promiseArr.push(fetchReviewPromise);
  //const promiseArr = [fetchReviewPromise];

  if (category) {
    const checkCategoryPromise = fetchCategory(category);
    promiseArr.push(checkCategoryPromise);
  }

  return Promise.all(promiseArr)
    .then(([reviews]) => {
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
