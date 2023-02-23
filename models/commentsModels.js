const db = require("../db/connection.js");

const fetchCommentsOfReview = (reviewId) => {
  return db
    .query(
      `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC`,
      [reviewId]
    )
    .then((response) => {
      const commentsOfReview = response.rows;
      return commentsOfReview;
    });
};

const addComment = (newComment, reviewId) => {
  return db
    .query(
      `INSERT INTO comments
    (body, author, review_id )
    VALUES
    ($1, $2, $3)
    RETURNING *;`,
      [newComment.body, newComment.username, reviewId]
    )
    .then(({ rows }) => {
      const postedComment = rows[0];
      return postedComment;
    });
};

module.exports = { addComment, fetchCommentsOfReview };
