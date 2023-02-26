const db = require("../db/connection.js");

const removeComment = (commentId) => {
  return db
    .query(
      `
  DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;
  `,
      [commentId]
    )
    .then(({ rows }) => {
      const deletedCommentArr = rows;
      if (!deletedCommentArr.length) {
        return Promise.reject({ status: 404, msg: "invalid comment id" });
      }
    });
};

const updateCommentVotesById = (commentId, votesInc) => {
  return db
    .query(
      `UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *`,
      [votesInc, commentId]
    )
    .then(({ rows }) => {
      const updatedCommentArr = rows;
      if (!updatedCommentArr.length) {
        return Promise.reject({ status: 404 });
      } else {
        return updatedCommentArr[0];
      }
    });
};

module.exports = { removeComment, updateCommentVotesById };
