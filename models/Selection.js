const mongoose = require("mongoose");

const SelectionSchema = new mongoose.Schema({
  name: String,
  value: String,
});

module.exports = mongoose.model("Selection", SelectionSchema);
