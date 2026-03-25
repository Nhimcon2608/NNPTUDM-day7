const mongoose = require("mongoose");

const Inventory = require("../models/inventory.model");
const Product = require("../models/product.model");

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    try {
      await Inventory.create({ product: product._id });
    } catch (error) {
      await Product.findByIdAndDelete(product._id);
      throw error;
    }

    const inventory = await Inventory.findOne({ product: product._id }).populate("product");

    return res.status(201).json({
      message: "Create product successfully.",
      data: {
        product,
        inventory,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.json({
      message: "Get all products successfully.",
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Product id is invalid.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.json({
      message: "Get product successfully.",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
