const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");

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
            expect(category).toHaveProperty("slug");
            expect(category).toHaveProperty("description");
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
          const reviewsCopy = [...reviews];
          const sortedReviews = reviewsCopy.sort((reviewA, reviewB) => {
            return reviewA.created_at - reviewB.created_at;
          });
          expect(reviews.length).toBeGreaterThan(0);
          expect(sortedReviews).toEqual(reviews);
          reviews.forEach((review) => {
            expect(review).toHaveProperty("owner");
            expect(review).toHaveProperty("title");
            expect(review).toHaveProperty("review_id");
            expect(review).toHaveProperty("review_img_url");
            expect(review).toHaveProperty("created_at");
            expect(review).toHaveProperty("votes");
            expect(review).toHaveProperty("designer");
            expect(review).toHaveProperty("comment_count");
            expect(review).toHaveProperty("category");
          });
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
          const commentsCopy = [...comments];
          const sortedComments = commentsCopy.sort((commentA, commentB) => {
            return commentA.created_at - commentB.created_at;
          });
          expect(sortedComments).toEqual(comments);
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("review_id");
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
});
