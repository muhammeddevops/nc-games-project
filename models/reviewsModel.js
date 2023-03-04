const { query } = require("../db/connection.js");
const db = require("../db/connection.js");

const fetchReviews = (
  sortBy = "created_at",
  orderBy = "DESC",
  category,
  limit = 10,
  page = 1
) => {
  const queryValues = [];

  const validOrderOptions = ["ASC", "DESC"];
  const validSortByProperties = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];

  let queryString = `SELECT reviews.*, 
  COUNT(comment_id) AS comment_count 
  FROM reviews 
  LEFT JOIN comments 
  ON comments.review_id = reviews.review_id `;

  if (category) {
    queryString += ` WHERE reviews.category = $1 `;
    queryValues.push(category);
  }

  queryString += `GROUP BY reviews.review_id ORDER BY `;

  if (validSortByProperties.includes(sortBy)) {
    queryString += `${sortBy} `;
  } else {
    return Promise.reject({
      status: 400,
      msg: "invalid sort_by",
    });
  }
  if (validOrderOptions.includes(orderBy)) {
    queryString += `${orderBy}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: "Please select a valid order-by option",
    });
  }

  return db.query(queryString, queryValues).then(({ rows }) => {
    const total_count = rows.length;

    const offset = page * limit - limit;
    queryValues.push(limit);
    queryValues.push(offset);
    if (category) {
      queryString += ` LIMIT $2 OFFSET $3;`;
    } else {
      queryString += ` LIMIT $1 OFFSET $2;`;
    }

    return db.query(queryString, queryValues).then(({ rows }) => {
      const results = rows;
      limit = +limit;
      page = +page;
      let lowerRange = offset + 1;
      let higherRange = offset + limit;

      if (limit < 1) {
        return Promise.reject({
          status: 400,
          msg: "Limit must be more than 0",
        });
      }

      const remainder = total_count - (page - 1) * limit;

      const accNumofPages = Math.ceil(total_count / limit);

      // removed if statement to check if limit is more than TC

      let range = "";
      // make an if statement if last page or not
      if (page === accNumofPages) {
        //on last page
        if (remainder === 1) {
          range = `Showing result ${total_count} of ${total_count}`;
        } else if (remainder > 1) {
          range = `Showing results ${lowerRange} to ${total_count}`;
        }
      } else if (page > accNumofPages) {
        // searching for non-existent pg
        return Promise.reject({
          status: 404,
          msg: "Error 404 page not found!",
        });
      } else {
        //on any pg other than last
        range = `Showing results ${lowerRange} to ${higherRange}`;
      }

      return { total_count, page, range, results };
    });
  });
};

const fetchReviewsById = (reviewId) => {
  return db
    .query(
      `
    SELECT reviews.*, 
    COUNT(comments.review_id)::int AS "comment_count"
    FROM reviews 
    LEFT JOIN comments 
    ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;
    `,
      [reviewId]
    )
    .then(({ rows }) => {
      const selectedReviewArr = rows;
      if (!selectedReviewArr.length) {
        return Promise.reject({ status: 404 });
      } else {
        return selectedReviewArr[0];
      }
    });
};

const updateReviewVotesById = (reviewId, votesInc) => {
  return db
    .query(
      `UPDATE reviews
  SET votes = votes + $1
  WHERE review_id = $2
  RETURNING *`,
      [votesInc, reviewId]
    )
    .then(({ rows }) => {
      const updatedReviewArr = rows;
      if (!updatedReviewArr.length) {
        return Promise.reject({ status: 404 });
      } else {
        return updatedReviewArr[0];
      }
    });
};

const fetchCommentsOfReview = (reviewId, limit = 10, page = 1) => {
  const offset = page * limit - limit;
  const queryValues = [reviewId];

  let queryString = `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC`;
  return db.query(queryString, queryValues).then((response) => {
    const commentsOfReview = response.rows;
    const total_count = commentsOfReview.length;
    queryValues.push(limit);
    queryValues.push(offset);

    queryString += " LIMIT $2 OFFSET $3";
    if (total_count === 0) {
      page = 1;
      range = "No results to show";
      results = [];
      return { total_count, page, range, results };
    } else {
      return db.query(queryString, queryValues).then(({ rows }) => {
        const results = rows;
        page = +page;
        limit = +limit;
        let lowerRange = offset + 1;
        let higherRange = offset + limit;

        if (limit < 1) {
          return Promise.reject({
            status: 400,
            msg: "Limit must be more than 0",
          });
        }

        const remainder = total_count - (page - 1) * limit;

        const accNumofPages = Math.ceil(total_count / limit);

        console.log(page, "page<<<");
        console.log(accNumofPages, "accNum");
        let range = "";
        // make an if statement if last page or not
        if (page === accNumofPages) {
          //on last page
          if (remainder === 1) {
            range = `Showing result ${total_count} of ${total_count}`;
          } else if (remainder > 1) {
            range = `Showing results ${lowerRange} to ${total_count}`;
          }
        } else if (page > accNumofPages) {
          // searching for non-existent pg
          return Promise.reject({
            status: 404,
            msg: "Error 404 page not found!",
          });
        } else {
          //on any pg other than last
          range = `Showing results ${lowerRange} to ${higherRange}`;
        }

        return { total_count, page, range, results };
      });
    }
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

const addReview = (newReview) => {
  return db
    .query(
      `INSERT INTO reviews
    (title, designer, owner, review_body, category)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *;`,
      [
        newReview.title,
        newReview.designer,
        newReview.owner,
        newReview.review_body,
        newReview.category,
      ]
    )
    .then(({ rows }) => {
      const postedReview = rows[0];
      return db
        .query(
          `SELECT owner, title, review_body, designer, category, reviews.review_id, reviews.votes, reviews.created_at, review_img_url,
        COUNT(reviews.review_id = comments.review_id)::int AS comment_count
        FROM reviews
        LEFT JOIN comments ON reviews.review_id = comments.review_id
        WHERE reviews.review_id = $1
        GROUP BY reviews.review_id`,
          [postedReview.review_id]
        )
        .then(({ rows }) => {
          const reviewWithComments = rows[0];
          return reviewWithComments;
        });
    });
};

module.exports = {
  fetchReviews,
  fetchReviewsById,
  updateReviewVotesById,
  fetchCommentsOfReview,
  addComment,
  addReview,
};
