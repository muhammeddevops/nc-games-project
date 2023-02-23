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
    test("200: responds with an array of review objects, ordered by desc date , which should have 9 properties", () => {
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
});

// if username or body is empty 400 error
