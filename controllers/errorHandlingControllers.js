const handleWrongPathErrors = (request, response, next) => {
  response.status(404).send({ msg: "Path not found" });
};

const handle500Errors = (error, request, response, next) => {
  if (error.status === 500) {
    response.status(500).send({ msg: "There has been a server error!" });
  } else {
    next(error);
  }
};

const handleCustomErrors = (error, request, response, next) => {
  if (error.code === "22P02" || error.code === "23502") {
    response.status(400).send({ msg: "Bad request" });
  } else if (error.status === 404) {
    response.status(404).send({ msg: "id provided does not exist" });
  } else if (error.code === "23503") {
    response.status(404).send({ msg: "Not found" });
  } else {
    next(error);
  }
};

module.exports = {
  handleWrongPathErrors,
  handle500Errors,
  handleCustomErrors,
};
