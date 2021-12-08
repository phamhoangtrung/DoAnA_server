const express = require("express");
const router = express.Router();

const { adminMiddleware } = require("../middleware/role");
const authMiddleware = require("../middleware/authentication");

const { all, one, update, create, remove, getSelection } = require("../controllers/products");

router.route("/").get(all).post(authMiddleware, adminMiddleware, create);

router.route("/get-selection").get(getSelection);

router.route("/:id").get(one).patch(authMiddleware, adminMiddleware, update).delete(authMiddleware, adminMiddleware, remove);

module.exports = router;
