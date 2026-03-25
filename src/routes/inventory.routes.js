const express = require("express");

const {
  getAllInventories,
  getInventoryById,
  addStock,
  removeStock,
  reservation,
  sold,
} = require("../controllers/inventory.controller");

const router = express.Router();

router.get("/", getAllInventories);
router.get("/:id", getInventoryById);
router.post("/add-stock", addStock);
router.post("/remove-stock", removeStock);
router.post("/reservation", reservation);
router.post("/sold", sold);

module.exports = router;
