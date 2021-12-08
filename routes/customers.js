const express = require("express");
const router = express.Router();

const { adminMiddleware, sysAdminMiddleware } = require("../middleware/role");
const authMiddleware = require("../middleware/authentication");

const { signup, signin, addAdmin, checkEmail, all, one, update, changeName } = require("../controllers/customers");

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/check-email").post(checkEmail);
router.route("/admin").patch(addAdmin);
router.route("/change-name").patch(authMiddleware, changeName);

router.route("/").get(authMiddleware, adminMiddleware, all).get(authMiddleware, one);
router.route("/:id").patch(authMiddleware, sysAdminMiddleware, update);

module.exports = router;
