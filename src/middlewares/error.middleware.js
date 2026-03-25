const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {}).join(", ");

    return res.status(400).json({
      message: `Duplicate value for field: ${duplicateField}.`,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${error.path}.`,
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error.",
  });
};

module.exports = errorHandler;
