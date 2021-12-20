const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "[Product]: Product name must be provided"],
    },
    price: {
      type: Number,
      required: [true, "[Product]: Product price must be provided"],
    },
    imageUrl: {
      type: String,
      require: [true, "Image must be provided"],
    },
    sale: {
      type: Number,
      min: [0, "[Product]: Sale percent must not lower than 0"],
      max: [99, "[Product]: Sale percent must not greater than 99"],
      default: 0,
    },
    rating: {
      type: Number,
      min: [0, "[Product]: Product rating must not be lower than 0"],
      max: [5, "[Product]: Product rating must not be greater than 5"],
      default: 0,
    },
    type: {
      type: String,
      required: [true, "Product type must be provided"],
    },
    gender: {
      type: String,
      required: [true, "Product gender must be provided"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
