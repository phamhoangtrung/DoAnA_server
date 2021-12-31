const express = require("express");
const router = express.Router();

const { adminMiddleware, sysAdminMiddleware } = require("../middleware/role");
const authMiddleware = require("../middleware/authentication");

const { all, one, update, create, remove, getSelection, rating, addSelection } = require("../controllers/products");

router.route("/").get(all).post(authMiddleware, adminMiddleware, create);

router.route("/selection").get(getSelection).post(authMiddleware, adminMiddleware, addSelection);

router.route("/rating").patch(rating);

router.route("/:id").get(one).patch(authMiddleware, adminMiddleware, update).delete(authMiddleware, adminMiddleware, remove);

module.exports = router;
