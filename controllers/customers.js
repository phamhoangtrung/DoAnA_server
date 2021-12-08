const Customer = require("../models/Customer");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Please provide email");
  const customer = await Customer.findOne({ email });
  if (customer) res.status(StatusCodes.OK).json({ valid: false });

  res.status(StatusCodes.OK).json({ valid: true });
};

const signin = async (req, res) => {
  const { email, password } = req.body.user;
  if (!email || !password) throw new BadRequestError("Please provide email and password");

  const customer = await Customer.findOne({ email });
  if (!customer) throw new UnauthenticatedError("Incorrect email");

  const isPasswordCorrect = await customer.comparePassword(password);
  if (!isPasswordCorrect) throw new UnauthenticatedError("Incorrect password");

  const token = customer.createJWT();
  res.status(StatusCodes.OK).json({ user: customer, token });
};

const signup = async (req, res) => {
  const { user } = req.body;
  const customer = await Customer.create({ ...user });
  const token = customer.createJWT();
  res.status(StatusCodes.CREATED).json({ user: customer, token });
};

const addAdmin = async ({ params, customer }, res) => {
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

const all = async (req, res) => {
  const customer = await Customer.find({});
  if (!customer) throw new NotFoundError(`No customer with id : ${_id}`);
  res.status(StatusCodes.OK).json({ customer });
};

const one = async ({ customer, params }, res) => {
  if (params) {
    customer = await Customer.findOne({ _id: params.id });
    res.status(StatusCodes.OK).json({ customer });
  } else {
    res.status(StatusCodes.OK).json({ customer });
  }
};

const update = async ({ params: { id: _id } }, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id },
    { role: "admin" },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!customer) throw new NotFoundError(`No customer with id : ${_id}`);
  res.status(StatusCodes.OK).json({ customer });
};

const changeName = async ({ body, customer }, res) => {
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

module.exports = { signup, signin, addAdmin, checkEmail, one, update, all, changeName };
