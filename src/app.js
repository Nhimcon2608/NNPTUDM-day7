const express = require("express");

const errorHandler = require("./middlewares/error.middleware");
const inventoryRoutes = require("./routes/inventory.routes");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Inventory API is running.",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/inventories", inventoryRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

app.use(errorHandler);

module.exports = app;
