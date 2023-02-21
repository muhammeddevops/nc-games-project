const { fetchReviews } = require("../models/reviewsModel.js");

const getReviews = (request, response, next) => {
  fetchReviews()
    .then((reviews) => {
      response.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getReviews };
