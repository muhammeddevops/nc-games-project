const { fetchCommentsOfReview } = require("../models/commentsModels.js");
const { fetchReviewsById } = require("../models/reviewsModel.js");

const getCommentsOfReview = (request, response, next) => {
  const { review_id } = request.params;

  const checkReviewExistsPromise = fetchReviewsById(review_id);
  const fetchCommentsPromise = fetchCommentsOfReview(review_id);

  Promise.all([checkReviewExistsPromise, fetchCommentsPromise])
    .then((result) => {
      const reviews = result[1];
      response.status(200).send(reviews);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getCommentsOfReview };
