require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const port = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect database:", error.message);
    process.exit(1);
  });
