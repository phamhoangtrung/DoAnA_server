const express = require("express");
const router = express.Router();

const { one, create } = require("../controllers/resource");

router.route("/").post(create);
router.route("/:id").get(one);

module.exports = router;
