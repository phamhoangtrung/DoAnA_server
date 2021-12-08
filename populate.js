require("dotenv").config();
const fs = require("fs");

const connectDB = require("./db/connect");
const Product = require("./models/product");

const jsonProducts = require("./products.json");

let dataJSON;
fs.readFile("controllers/product.json", "utf-8", (err, data) => {
  const { type } = JSON.parse(data.toString());
  dataJSON = jsonProducts.map((d) => {
    const random = Math.floor(Math.random() * type.length);
    let percent = Math.floor(Math.random() * 100);
    let rating = Math.floor(Math.random() * 5);

    if (percent > 0 && percent < 0) percent = 0;

    return { ...d, type: type[random], sale: percent, rating };
  });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.create(dataJSON);
    console.log("Success!!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
