const express = require("express");
const router = express.Router();

const { adminMiddleware } = require("../middleware/role");
const authMiddleware = require("../middleware/authentication");

const { all, one, update, create, remove } = require("../controllers/products");
const { rating, selection } = require("../controllers/products-util");

router.route("/").get(all).post(authMiddleware, adminMiddleware, create);
router.route("/selection").get(selection.all).post(authMiddleware, adminMiddleware, selection.create);
router.route("/rating").patch(rating);
router.route("/:id").get(one).patch(authMiddleware, adminMiddleware, update).delete(authMiddleware, adminMiddleware, remove);

module.exports = router;
