const {
  patchCommentVotesById,
  deleteCommentById,
} = require("../controllers/commentsControllers");

const commentsRouter = require("express").Router();

commentsRouter.delete("/:comment_id", deleteCommentById);
commentsRouter.patch("/:comment_id", patchCommentVotesById);

module.exports = commentsRouter;
