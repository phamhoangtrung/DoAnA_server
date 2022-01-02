const Customer = require("../models/Customer");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const add = async ({ params, customer }, res) => {
  if (customer.role !== "system-admin") throw new UnauthenticatedError("No permission to add admin");

  const updatedCustomer = Customer.findByIdAndUpdate(
    { _id: params.id },
    { role: "admin" },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).send({ customer: updatedCustomer });
};

const updateName = async ({ body, customer }, res) => {
  const data = await Customer.findOneAndUpdate(
    { _id: customer.customerId },
    { name: body.name },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!data) throw new NotFoundError(`No customer with id : ${_id}`);
  res.status(StatusCodes.OK).json({ customer: data });
};

const checkEmailExist = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Please provide email");
  const customer = await Customer.findOne({ email });
  if (customer) res.status(StatusCodes.OK).json({ valid: false });

  res.status(StatusCodes.OK).json({ valid: true });
};

module.exports = { add, updateName, checkEmailExist };
