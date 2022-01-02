const Customer = require("../models/Customer");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

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

const create = async (req, res) => {
  const { user } = req.body;
  const customer = await Customer.create({ ...user });
  const token = customer.createJWT();
  res.status(StatusCodes.CREATED).json({ user: customer, token });
};

const update = async ({ params: { id: _id } }, res) => {
  const customer = await Customer.findOneAndUpdate({ _id }, { role: "admin" }, {
    new: true,
    runValidators: true,
  }
  );
  if (!customer) throw new NotFoundError(`No customer with id : ${_id}`);
  res.status(StatusCodes.OK).json({ customer });
};

module.exports = { all, one, create, update, signin };
