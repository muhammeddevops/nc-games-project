handle404Errors = (request, response, next) => {
  response.status(404).send({ msg: "Path not found" });
};

handle500Errors = (error, request, response, next) => {
  if (error.status === 500) {
    response.status(500).send({ msg: "There has been a server error!" });
  } else {
    next(error);
  }
};

module.exports = { handle404Errors, handle500Errors };
