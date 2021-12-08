const express = require("express");
const router = express.Router();

const { adminMiddleware } = require("../middleware/role");
const authMiddleware = require("../middleware/authentication");

const { one, create, remove, all, finishCart } = require("../controllers/carts");

router.route("/").post(authMiddleware, create).get(authMiddleware, all);

router.route("/change-status/:id").patch(authMiddleware, adminMiddleware, finishCart);

router.route("/:id").delete(authMiddleware, remove).get(authMiddleware, one);

module.exports = router;
