const { request, response } = require("../db/app.js");
const { fetchCategory } = require("../models/categoriesModel.js");
const {
  fetchReviews,
  fetchReviewsById,
  updateReviewVotesById,
  fetchCommentsOfReview,
  addComment,
  addReview,
} = require("../models/reviewsModel.js");

const getReviews = (request, response, next) => {
  const { sort_by, order_by, category } = request.query;
  const promiseArr = [];

  const fetchReviewPromise = fetchReviews(sort_by, order_by, category);
  promiseArr.push(fetchReviewPromise);

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

const getCommentsOfReview = (request, response, next) => {
  const { review_id } = request.params;

  const checkReviewExistsPromise = fetchReviewsById(review_id);
  const fetchCommentsPromise = fetchCommentsOfReview(review_id);

  Promise.all([checkReviewExistsPromise, fetchCommentsPromise])
    .then((result) => {
      const reviews = result[1];
      response.status(200).send(reviews);
    })
    .catch((error) => {
      next(error);
    });
};

const postComment = (request, response, next) => {
  const newComment = request.body;
  const { review_id } = request.params;
  addComment(newComment, review_id)
    .then((postedComment) => {
      response.status(201).send(postedComment);
    })
    .catch((err) => {
      next(err);
    });
};

const postReview = (request, response, next) => {
  const newReview = request.body;

  addReview(newReview)
    .then((postedReview) => {
      response.status(201).send(postedReview);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getReviews,
  getReviewsById,
  patchReviewVotesById,
  getCommentsOfReview,
  postComment,
  postReview,
};
