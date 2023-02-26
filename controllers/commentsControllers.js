const {
  removeComment,
  updateCommentVotesById,
} = require("../models/commentsModels.js");

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

const patchCommentVotesById = (request, response, next) => {
  const { comment_id } = request.params;
  const { inc_votes } = request.body;

  updateCommentVotesById(comment_id, inc_votes)
    .then((updatedComment) => {
      response.status(200).send(updatedComment);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { deleteCommentById, patchCommentVotesById };
