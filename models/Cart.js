const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  quantity: Number,
  star: {
    type: Number,
    default: 3,
    min: [0, "[Product]: Product rating must not be lower than 0"],
    max: [5, "[Product]: Product rating must not be greater than 5"],
  },
});

const CartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      require: [true, `[Cart]: Customer ID must be provided`],
    },
    orderedProduct: {
      type: [CartItemSchema],
      ref: "CartItemSchema",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
