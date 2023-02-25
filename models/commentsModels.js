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

module.exports = { removeComment };
