const { getApi } = require("../controllers/apiController.js");
const categoriesRouter = require("./categories-router");
const reviewsRouter = require("./reviews-router");
const commentsRouter = require("./comments-router");
const userRouter = require("./users-router");

const apiRouter = require("express").Router();

apiRouter.get("/", getApi);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", userRouter);

module.exports = apiRouter;
