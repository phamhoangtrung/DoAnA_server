const express = require("express");
const router = express.Router();

const { adminMiddleware, sysAdminMiddleware } = require("../middleware/role");
const authMiddleware = require("../middleware/authentication");

const { all, one, create, update, signin } = require("../controllers/customers");
const { add, updateName, checkEmailExist } = require("../controllers/auth");

router.route("/signin").post(signin);
router.route("/signup").post(create);
router.route("/check-email").post(checkEmailExist);

router.route("/admin").patch(add);
router.route("/change-name").patch(authMiddleware, updateName);

router.route("/").get(authMiddleware, adminMiddleware, all).get(authMiddleware, one);
router.route("/:id").patch(authMiddleware, sysAdminMiddleware, update);

module.exports = router;
