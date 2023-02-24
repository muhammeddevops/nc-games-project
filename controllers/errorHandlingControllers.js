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

const handleSQLErrors = (error, request, response, next) => {
  if (error.code === "22P02" || error.code === "23502") {
    response.status(400).send({ msg: "Bad request" });
  } else if (error.code === "23503") {
    response.status(404).send({ msg: "Not found" });
  }
};

const handleCustomErrors = (error, request, response, next) => {
  if (error.msg === "Please select a valid order-by option") {
    response
      .status(400)
      .send({ msg: "Please order by ascending or descending" });
  } else if (error.msg === "Category not found") {
    response.status(404).send({ msg: "Please select a valid category!" });
  } else if (error.msg === "invalid sort_by") {
    response.status(400).send({ msg: "Please select a valid sort-by option!" });
  } else if (error.status === 404) {
    response.status(404).send({ msg: "Value provided does not exist" });
  } else {
    next(error);
  }
};
module.exports = {
  handleWrongPathErrors,
  handle500Errors,
  handleCustomErrors,
  handleSQLErrors,
};
