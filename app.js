require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const cors = require("cors");
const fileupload = require("express-fileupload");

const connectDB = require("./db/connect");

const productsRoute = require("./routes/products");
const customerRoute = require("./routes/customers");
const cartRoute = require("./routes/carts");
const resourceRoute = require("./routes/resource");

const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

const backup = require("./backup");

const Product = require("./models/Product");
// middleware
app.use(express.json());
app.use(fileupload());
app.use(cors());

// routes
app.use("/api/v1/product", productsRoute);
app.use("/api/v1/auth", customerRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/photo", resourceRoute);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// start
(async () => {
  try {
    const port = process.env.PORT;
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening port ${port}...`));
    const backupTime = 86400 * 1000 // save backup data after 1 day
    setInterval(() => { backup(); }, backupTime);
  } catch (error) {
    console.log(error);
  }
})();
