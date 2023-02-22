const { fetchCommentsOfReview } = require("../models/commentsModels.js");
const { fetchReviewsById } = require("../models/reviewsModel.js");

const getCommentsOfReview = (request, response, next) => {
  const { review_id } = request.params;

  const checkReviewExistsPromise = fetchReviewsById(review_id);
  const fetchCommentsPromise = fetchCommentsOfReview(review_id);

  Promise.all([checkReviewExistsPromise, fetchCommentsPromise])
    .then((result) => {
      console.log(result);
      const reviews = result[1];
      console.log(reviews, "reviews<<<<");
      response.status(200).send(reviews);
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

module.exports = { getCommentsOfReview };
