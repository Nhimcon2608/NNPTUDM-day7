const mongoose = require("mongoose");

const Inventory = require("../models/inventory.model");
const { validateProductAndQuantity } = require("../utils/inventory.utils");

const inventoryPopulation = {
  path: "product",
  select: "name sku price description createdAt updatedAt",
};

const getAllInventories = async (req, res, next) => {
  try {
    const inventories = await Inventory.find()
      .populate(inventoryPopulation)
      .sort({ createdAt: -1 });

    return res.json({
      message: "Get all inventories successfully.",
      data: inventories,
    });
  } catch (error) {
    return next(error);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Inventory id is invalid.",
      });
    }

    const inventory = await Inventory.findById(id).populate(inventoryPopulation);

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found.",
      });
    }

    return res.json({
      message: "Get inventory successfully.",
      data: inventory,
    });
  } catch (error) {
    return next(error);
  }
};

const addStock = async (req, res, next) => {
  try {
    const validationError = validateProductAndQuantity(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { product, quantity } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      { product },
      { $inc: { stock: quantity } },
      { new: true, runValidators: true }
    ).populate(inventoryPopulation);

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found for this product.",
      });
    }

    return res.json({
      message: "Add stock successfully.",
      data: inventory,
    });
  } catch (error) {
    return next(error);
  }
};

const removeStock = async (req, res, next) => {
  try {
    const validationError = validateProductAndQuantity(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { product, quantity } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      { product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, runValidators: true }
    ).populate(inventoryPopulation);

    if (inventory) {
      return res.json({
        message: "Remove stock successfully.",
        data: inventory,
      });
    }

    const existingInventory = await Inventory.findOne({ product });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory not found for this product.",
      });
    }

    return res.status(400).json({
      message: "Not enough stock to remove.",
    });
  } catch (error) {
    return next(error);
  }
};

const reservation = async (req, res, next) => {
  try {
    const validationError = validateProductAndQuantity(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { product, quantity } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      { product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, reserved: quantity } },
      { new: true, runValidators: true }
    ).populate(inventoryPopulation);

    if (inventory) {
      return res.json({
        message: "Reservation successfully.",
        data: inventory,
      });
    }

    const existingInventory = await Inventory.findOne({ product });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory not found for this product.",
      });
    }

    return res.status(400).json({
      message: "Not enough stock to reserve.",
    });
  } catch (error) {
    return next(error);
  }
};

const sold = async (req, res, next) => {
  try {
    const validationError = validateProductAndQuantity(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { product, quantity } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      { product, reserved: { $gte: quantity } },
      { $inc: { reserved: -quantity, soldCount: quantity } },
      { new: true, runValidators: true }
    ).populate(inventoryPopulation);

    if (inventory) {
      return res.json({
        message: "Sold successfully.",
        data: inventory,
      });
    }

    const existingInventory = await Inventory.findOne({ product });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory not found for this product.",
      });
    }

    return res.status(400).json({
      message: "Not enough reserved quantity to mark as sold.",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllInventories,
  getInventoryById,
  addStock,
  removeStock,
  reservation,
  sold,
};
