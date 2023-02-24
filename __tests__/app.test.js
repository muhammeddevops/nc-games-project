const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const jestSorted = require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return connection.end();
});

describe("app", () => {
  describe("Server errors", () => {
    test("404: responds with error msg when given valid but non-existent path", () => {
      return request(app)
        .get("/faulty-path")
        .expect(404)
        .then((response) => {
          response;
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Path not found");
        });
    });
  });

  describe("GET /api/categories", () => {
    test("200: responds with an array of category objects", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body }) => {
          const categories = body.categories;
          expect(categories).toHaveLength(4);
          categories.forEach((category) => {
            expect(category).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });

  describe("GET /api/reviews", () => {
    test("200: responds with an array of review objects, ordered by desc date ,each of which, should have 9 properties", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.reviews;

          expect(reviews).toBeSortedBy("created_at", { descending: true });

          reviews.forEach((review) => {
            expect(review).toMatchObject({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String),
              category: expect.any(String),
            });
          });
        });
    });
  });

  describe("GET /api/reviews/:review_id", () => {
    test("200: responds with a specific review object, which should have 9 properties", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((response) => {
          const review = response.body;
          expect(review.review_id).toBe(1);
          expect(review.title).toBe("Agricola");
          expect(review.review_body).toBe("Farmyard fun!");
          expect(review.designer).toBe("Uwe Rosenberg");
          expect(review.review_img_url).toBe(
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700"
          );
          expect(review.votes).toBe(1);
          expect(review.category).toBe("euro game");
          expect(review.owner).toBe("mallionaire");
          expect(review.created_at).toBe("2021-01-18T10:00:20.514Z");
        });
    });
    test('404: responds with "Not Found" error', () => {
      return request(app)
        .get("/api/reviews/999")
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("id provided does not exist");
        });
    });

    test('400: responds with "Bad request" error', () => {
      return request(app)
        .get("/api/reviews/not-a-number")
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("GET /api/reviews/:review_id/comments", () => {
    test("200: responds with an array of comment objects if review has comments, ordered by desc date , each of which, should have 6 properties", () => {
      return request(app)
        .get("/api/reviews/3/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body;

          expect(comments).toBeSortedBy("created_at", { descending: true });

          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              review_id: expect.any(Number),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
            });
          });
        });
    });

    test("200: responds with an empty array if review has no comments", () => {
      return request(app)
        .get("/api/reviews/5/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body;
          expect(comments).toEqual([]);
        });
    });

    test('404: responds with "Not found" error if given a non existent review id', () => {
      return request(app)
        .get("/api/reviews/999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("id provided does not exist");
        });
    });

    test("400: responds with bad request error if not given a number ", () => {
      return request(app)
        .get("/api/reviews/words-not-num/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });

  describe("POST /api/reviews/:review_id/comments, adds comment to a review", () => {
    test("201: should respond with newly posted comment", () => {
      const newComment = {
        body: "My family loved this game too!",
        username: "mallionaire",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(201)
        .then((response) => {
          const postedComment = response.body;
          expect(postedComment.author).toBe("mallionaire");
          expect(postedComment.body).toBe("My family loved this game too!");
          expect(postedComment.comment_id).toBe(7);
          expect(postedComment.review_id).toBe(2);
          expect(postedComment.votes).toBe(0);
        });
    });

    test("201: Should ignore any extra keys on comment and post without the extra keys", () => {
      const newComment = {
        body: "I dont like your review!",
        username: "bainesface",
        randomKey: "irrelevant",
      };
      return request(app)
        .post("/api/reviews/4/comments")
        .send(newComment)
        .expect(201)
        .then((response) => {
          const postedComment = response.body;
          expect(postedComment.author).toBe("bainesface");
          expect(postedComment.body).toBe("I dont like your review!");
          expect(postedComment.comment_id).toBe(7);
          expect(postedComment.review_id).toBe(4);
          expect(postedComment.votes).toBe(0);
        });
    });

    test("404: should return not found error when review is not found", () => {
      const newComment = {
        body: "The game was not that good, I think youre exaggerating",
        username: "dav3rid",
      };
      return request(app)
        .post("/api/reviews/999/comments")
        .send(newComment)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Not found");
        });
    });

    test("400: Should return a bad request error if comment has incorrect properties", () => {
      const newComment = {
        randomKey: "notWhatYouNeed",
      };
      return request(app)
        .post("/api/reviews/3/comments")
        .send(newComment)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });

    test("404: Should return a not found error when the username is non existent", () => {
      const newComment = {
        body: "im not a user but i still want to comment",
        username: "Lebron J",
      };
      return request(app)
        .post("/api/reviews/3/comments")
        .send(newComment)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Not found");
        });
    });
    test("400: should return Bad request error when given a id that is not a number", () => {
      const newComment = {
        body: "I like this review",
        username: "philippaclaire9",
      };
      return request(app)
        .post("/api/reviews/not-a-num/comments")
        .send(newComment)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("PATCH /api/reviews/:review_id", () => {
    test("200: should respond with the updated review", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedReview = body;
          expect(updatedReview.votes).toBe(8);
          expect(updatedReview.review_id).toBe(1);
          expect(updatedReview.title).toBe("Agricola");
          expect(updatedReview.review_body).toBe("Farmyard fun!");
          expect(updatedReview.designer).toBe("Uwe Rosenberg");
          expect(updatedReview.review_img_url).toBe(
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700"
          );
          expect(updatedReview.category).toBe("euro game");
          expect(updatedReview.owner).toBe("mallionaire");
          expect(updatedReview.created_at).toBe("2021-01-18T10:00:20.514Z");
        });
    });

    test("200: Should decrease the vote count if increment is a negative number", () => {
      const voteIncrement = { inc_votes: -1 };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedReview = body;
          expect(updatedReview.votes).toBe(0);
        });
    });

    test("200: Should ignore any extra keys on the object and return review correctly patched", () => {
      const voteIncrement = { inc_votes: 7, randomKey: "irrelevant" };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedReview = body;
          expect(updatedReview.votes).toBe(8);
        });
    });

    test("404: Should respond with a not found error if review id is non existent", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/999")
        .send(voteIncrement)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("id provided does not exist");
        });
    });
    test("400: Should respond with a Bad request error if increment is not a number", () => {
      const voteIncrement = { inc_votes: "not-a-num" };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
    test("400: should respond with a Bad request error if no increment is provided", () => {
      const voteIncrement = { randomKey: "random" };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
    test("400: should respond with a Bad request error if review id is not a number", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/not-a-num")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe(" GET /api/users", () => {
    test("200: responds with an array of user objects", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const users = body.users;
          expect(users).toHaveLength(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });

    test("404: responds with error msg when given valid but non-existent path", () => {
      return request(app)
        .get("/api/faulty-path")
        .expect(404)
        .then((response) => {
          response;
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Path not found");
        });
    });
  });
});
