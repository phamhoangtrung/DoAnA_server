const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CustomerSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: [true, "Name must be provided"],
  },
  email: {
    type: String,
    trim: true,
    require: [true, "Email must be provided"],
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Invalid email"],
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    require: [true, "Password must be provided"],
    minLength: [7, "Password must be greater than 7 characters"],
  },
  age: {
    type: Number,
    min: [0, "Age must not lower than 0"],
    max: [100, "Age must not greater than 100"],
    require: [true, "Age must be provided"],
  },
  address: {
    type: String,
    trim: true,
    require: [true, "City must be provided"],
  },
  phone: {
    type: String,
    trim: true,
    require: [true, "Phone must be provided"],
    match: [/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Invalid phone number"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
    },
    default: "user",
  },
  totalBuy: {
    type: Number,
    default: 0,
  },
  memberShip: {
    type: Number,
    min: [0, "Member ship level must not lower than 0"],
    max: [10, "Member ship level must not greater than 10"],
    default: 0,
  },
});

CustomerSchema.pre("save", async function () {
  // hash password before save to dtb
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// add extra method to Model
CustomerSchema.methods.createJWT = function () {
  return jwt.sign({ customerId: this._id, name: this.name, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
};

CustomerSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("Customer", CustomerSchema);
