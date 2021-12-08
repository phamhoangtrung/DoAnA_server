const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  quantity: Number,
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
