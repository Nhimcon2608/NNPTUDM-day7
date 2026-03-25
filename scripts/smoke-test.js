require("dotenv").config();

const assert = require("node:assert/strict");

const mongoose = require("mongoose");

const app = require("../src/app");
const connectDatabase = require("../src/config/database");
const Inventory = require("../src/models/inventory.model");
const Product = require("../src/models/product.model");

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve(server);
    });
  });

const stopServer = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const requestJson = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  return { status: response.status, body: data };
};

const run = async () => {
  const uniqueSuffix = Date.now();
  const sku = `TEST-${uniqueSuffix}`;
  let server;
  let productId;
  let inventoryId;

  try {
    await connectDatabase();
    server = await startServer();

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const createProductResponse = await requestJson(baseUrl, "/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Test Product",
        sku,
        price: 150000,
        description: "Test inventory workflow",
      }),
    });

    assert.equal(createProductResponse.status, 201);
    productId = createProductResponse.body.data.product._id;
    inventoryId = createProductResponse.body.data.inventory._id;
    assert.equal(createProductResponse.body.data.inventory.stock, 0);
    assert.equal(createProductResponse.body.data.inventory.reserved, 0);
    assert.equal(createProductResponse.body.data.inventory.soldCount, 0);

    const getProductByIdResponse = await requestJson(baseUrl, `/api/products/${productId}`);

    assert.equal(getProductByIdResponse.status, 200);
    assert.equal(getProductByIdResponse.body.data._id, productId);
    assert.equal(getProductByIdResponse.body.data.sku, sku);

    const addStockResponse = await requestJson(baseUrl, "/api/inventories/add-stock", {
      method: "POST",
      body: JSON.stringify({ product: productId, quantity: 10 }),
    });

    assert.equal(addStockResponse.status, 200);
    assert.equal(addStockResponse.body.data.stock, 10);

    const removeStockResponse = await requestJson(baseUrl, "/api/inventories/remove-stock", {
      method: "POST",
      body: JSON.stringify({ product: productId, quantity: 2 }),
    });

    assert.equal(removeStockResponse.status, 200);
    assert.equal(removeStockResponse.body.data.stock, 8);

    const reservationResponse = await requestJson(baseUrl, "/api/inventories/reservation", {
      method: "POST",
      body: JSON.stringify({ product: productId, quantity: 3 }),
    });

    assert.equal(reservationResponse.status, 200);
    assert.equal(reservationResponse.body.data.stock, 5);
    assert.equal(reservationResponse.body.data.reserved, 3);

    const soldResponse = await requestJson(baseUrl, "/api/inventories/sold", {
      method: "POST",
      body: JSON.stringify({ product: productId, quantity: 2 }),
    });

    assert.equal(soldResponse.status, 200);
    assert.equal(soldResponse.body.data.reserved, 1);
    assert.equal(soldResponse.body.data.soldCount, 2);

    const getInventoryByIdResponse = await requestJson(baseUrl, `/api/inventories/${inventoryId}`);

    assert.equal(getInventoryByIdResponse.status, 200);
    assert.equal(getInventoryByIdResponse.body.data.product._id, productId);

    const getAllInventoriesResponse = await requestJson(baseUrl, "/api/inventories");

    assert.equal(getAllInventoriesResponse.status, 200);
    assert.ok(
      getAllInventoriesResponse.body.data.some((inventory) => inventory._id === inventoryId)
    );

    console.log("Smoke test passed.");
  } finally {
    if (productId) {
      await Inventory.deleteOne({ product: productId });
      await Product.deleteOne({ _id: productId });
    } else {
      await Product.deleteOne({ sku });
    }

    if (server) {
      await stopServer(server);
    }

    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Smoke test failed:", error);
  process.exit(1);
});
