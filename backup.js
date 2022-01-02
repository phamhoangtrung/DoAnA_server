const connectDB = require("./db/connect");
require("dotenv").config();

const fs = require("fs");

const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Cart = require("./models/Cart");

module.exports = async function () {
  try {
    await connectDB(process.env.MONGO_URI);
    const data = {
      product: await Product.find({}),
      cart: await Cart.find({}),
      customer: await Customer.find({}),
    };
    const dataStr = JSON.stringify(data);
    fs.writeFile("backup.json", dataStr, (err) => {
      if (err) throw new Error(err);
      console.log("Backup success !!!");
    });
  } catch (error) {
    process.exit(1);
  }
};
