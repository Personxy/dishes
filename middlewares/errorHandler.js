const { STATUS_CODES, ERROR_MESSAGES } = require("../config/constants");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose 错误处理
  if (err.name === "CastError") {
    error.message = "资源不存在";
    error.statusCode = STATUS_CODES.NOT_FOUND;
  }

  res.status(error.statusCode || STATUS_CODES.SERVER_ERROR).json({
    success: false,
    error: error.message || ERROR_MESSAGES.SERVER_ERROR,
  });
};

module.exports = errorHandler;
