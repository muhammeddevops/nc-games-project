const { addComment } = require("../models/commentsModels.js");

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

module.exports = { postComment };
