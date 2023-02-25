const { removeComment } = require("../models/commentsModels.js");

const deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;

  removeComment(comment_id)
    .then((result) => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { deleteCommentById };
