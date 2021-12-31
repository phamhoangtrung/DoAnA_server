const { UnauthenticatedError } = require("../errors");

const adminMiddleware = async ({ customer }, res, next) => {
  const { role } = customer;
  if (role === "admin" || role === "sys-admin") next();
  else throw new UnauthenticatedError("[Authentication]: No Permission");
};

const sysAdminMiddleware = async ({ customer }, res, next) => {
  const { role } = customer;
  if (role === "sys-admin") next();
  else throw new UnauthenticatedError("[Authentication]: No Permission");
};

module.exports = { adminMiddleware, sysAdminMiddleware };
