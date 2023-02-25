const {
  getCommentsOfReview,
  postComment,
  deleteCommentById,
} = require("../controllers/commentsControllers");

const commentsRouter = require("express").Router();

commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
