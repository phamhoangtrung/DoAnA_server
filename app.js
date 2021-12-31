require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./db/connect");
const productsRoute = require("./routes/products");
const customerRoute = require("./routes/customers");
const cartRoute = require("./routes/carts");

const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");
const upload = require("./middleware/multer");
const fs = require("fs");

const backup = require("./backup");

// middleware
app.use(express.json());
app.use(cors());

// routes

app.get("/", (req, res) => {
  res.send('<h1>Store API</h1><a href="/api/v1/products">products route</a>');
});

app.get("/photo/:id", (req, res) => {
  var filename = req.params.id;
  fs.readFile("uploads/" + filename, function read(err, data) {
    if (err) throw err;
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(data);
  });
});

app.use("/api/v1/product", productsRoute);
app.use("/api/v1/auth", customerRoute);
app.use("/api/v1/cart", cartRoute);

app.post("/api/v1/uploadphoto", upload.single("file"), async (req, res) => {
  const { filename } = req.file;
  const fullUrl = `${req.protocol}://${req.get("host")}/photo/${filename}`;
  res.send({ filename: fullUrl });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    // connectDB
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening port ${port}...`));
    setInterval(() => {
      backup();
    }, 3600000);
  } catch (error) {
    console.log(error);
  }
};

start();
