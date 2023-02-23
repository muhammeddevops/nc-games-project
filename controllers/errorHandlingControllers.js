const handleWrongPathErrors = (request, response, next) => {
  response.status(404).send({ msg: "Path not found" });
};

const handle404Errors = (error, request, response, next) => {
  if (error.status === 404) {
    response.status(404).send({ msg: "id provided does not exist" });
<<<<<<< HEAD
  } else {
    next(error);
  }
};

const handle500Errors = (error, request, response, next) => {
  if (error.status === 500) {
    response.status(500).send({ msg: "There has been a server error!" });
=======
>>>>>>> 5e35f7160bfbecb54d496077307a7896754b9925
  } else {
    next(error);
  }
};

<<<<<<< HEAD
const handle400Errors = (error, request, response, next) => {
  if (error.status === 400) {
=======
const handle500Errors = (error, request, response, next) => {
  if (error.status === 500) {
    response.status(500).send({ msg: "There has been a server error!" });
  } else {
    error;
    next(error);
  }
};

const handle400Errors = (error, request, response, next) => {
  if (error.status === 400 || error.code === "22P02") {
>>>>>>> 5e35f7160bfbecb54d496077307a7896754b9925
    response.status(400).send({ msg: "Bad request" });
  } else {
    next(error);
  }
};

module.exports = {
  handleWrongPathErrors,
  handle404Errors,
  handle500Errors,
  handle400Errors,
};