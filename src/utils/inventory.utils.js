const mongoose = require("mongoose");

const validateProductAndQuantity = ({ product, quantity }) => {
  if (!product || !mongoose.isValidObjectId(product)) {
    return "Field 'product' must be a valid MongoDB ObjectId.";
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
    return "Field 'quantity' must be a positive integer.";
  }

  return null;
};

module.exports = {
  validateProductAndQuantity,
};
