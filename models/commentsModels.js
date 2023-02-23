const db = require("../db/connection.js");

const addComment = (newComment, reviewId) => {
  return db
    .query(
      `INSERT INTO comments
    (body, votes, author, review_id, created_at )
    VALUES
    ($1, 0, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;`,
      [newComment.body, newComment.username, reviewId]
    )
    .then(({ rows }) => {
      const postedComment = rows[0];
      return postedComment;
    });
};

module.exports = { addComment };
