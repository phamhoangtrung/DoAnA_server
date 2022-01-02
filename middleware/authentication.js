const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const { UnauthenticatedError } = require("../errors");

const authMiddleware = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("[Authentication]: Invalid authentication");
  }
  const token = authHeader.split(" ")[1];

  try {
    // check user exist
    const { customerId } = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findOne({
      _id: customerId,
    });
    if (!customer) throw new Error();
    const { name, role, totalBuy, memberShip, email } = customer;
    req.customer = {
      customerId,
      email,
      name,
      role,
      memberShip,
      totalBuy,
    };
    next();
  } catch {
    throw new UnauthenticatedError("[Authentication]: Invalid authentication");
  }
};

module.exports = authMiddleware;
