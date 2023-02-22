const { fetchCommentsOfReview } = require("../models/commentsModels.js");

const getCommentsOfReview = (request, response, next) => {
  const { review_id } = request.params;

  fetchCommentsOfReview(review_id)
    .then((review) => {
      console.log(review);
      response.status(200).send(review);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getCommentsOfReview };
