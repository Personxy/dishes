const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  NOT_FOUND: "未找到资源",
  SERVER_ERROR: "服务器内部错误",
  VALIDATION_ERROR: "验证错误",
};

module.exports = {
  STATUS_CODES,
  ERROR_MESSAGES,
};
