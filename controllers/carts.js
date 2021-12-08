const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError, BadRequestError, InternalServerError } = require("../errors");

const { MEMBERSHIP_DISCOUNT, MEMBERSHIP_LEVEL } = require("../utils/const");

const all = async ({ customer }, res) => {
  const { customerId, role } = customer;
  let carts;
  if (role === "admin" || role === "syx-admin") {
    carts = await Cart.find({});
  } else {
    carts = await Cart.find({ customerId });
  }
  console.log(carts);

  const transformedCart = carts.map(async (c) => {
    const orderedProduct = await transformCartItem(c.orderedProduct);
    return {
      customerId: c.customerId,
      createdAt: c.createdAt,
      customerId: c.customerId,
      status: c.status,
      total: c.total,
      _id: c._id,
      updatedAt: c.updatedAt,
      orderedProduct,
    };
  });
  const newCarts = await Promise.all(transformedCart);

  res.status(StatusCodes.OK).json({ carts: newCarts });
};

const one = async ({ customer, params }, res) => {
  const cart = await Cart.findOne({ _id: params.id });
  if (!cart) throw new NotFoundError(`No cart found cart with id ${params.id}`);

  if (!cart.customerId.equals(customer.customerId)) throw new UnauthenticatedError("[Authentication]: Invalid authentication1");

  const orderedProduct = await transformCartItem(cart.orderedProduct);
  const newCart = {
    id: cart._id,
    customerId: cart.customerId,
    orderedProduct,
  };
  res.status(StatusCodes.OK).json({ cart: newCart });
};

const remove = async ({ params, customer }, res) => {
  const cart = await Cart.findOne({ _id: params.id });
  if (!cart) throw new NotFoundError(`No cart found cart with id ${params.id}`);

  if (cart.status === "accepted") throw new BadRequestError("Can not delete accepted product");

  if (!cart.customerId.equals(customer.customerId)) throw new UnauthenticatedError("[Authentication]: Invalid authentication");

  const deletedCart = await Cart.deleteOne({ _id: cart.id });
  res.status(StatusCode.OK).json({ cart: deletedCart });
};

const create = async ({ customer, body }, res) => {
  const { customerId, memberShip } = customer;
  // Create a Cart
  const cart = await Cart.create({
    orderedProduct: body,
    customerId,
  });

  // transform item format
  const orderedProduct = await transformCartItem(cart.orderedProduct);
  const totalPrice = orderedProduct.reduce((acc, cur) => acc + (1 - cur.sale / 100) * cur.quantity * cur.price, 0);

  // Count total price
  const memberDiscount = (totalPrice * (1 - memberShip / 100)).toFixed(2);
  let createdCart;
  try {
    // Update 'cart' total on the top
    createdCart = await Cart.findOneAndUpdate(
      { _id: cart._id },
      { total: memberDiscount },
      {
        new: true,
        runValidators: true,
      }
    );
  } catch (error) {
    // Delete that 'cart' if any error
    await Cart.findOneAndDelete({ _id: cart._id });
    throw new InternalServerError("Server Error please try again later");
  }

  res.status(StatusCodes.OK).json({ cart: createdCart });
};

const finishCart = async ({ params }, res) => {
  // update accepted 'cart'

  const fCart = await Cart.findOne({ _id: params._id });
  if (fCart && fCart.status === "accepted") {
    throw new BadRequestError("Cart accepted already");
  }

  const cart = await Cart.findOneAndUpdate(
    { _id: params.id },
    { status: "accepted" },
    {
      new: true,
      runValidators: true,
    }
  );

  // take customer info
  let { totalBuy, memberShip } = await Customer.findOne({
    _id: cart.customerId,
  });

  // update totalBuy and membership level
  const updatedTotalBuy = totalBuy + cart.total;
  if (updatedTotalBuy >= MEMBERSHIP_LEVEL[memberShip + 1]) {
    memberShip += 1;
  }
  await Customer.updateOne(
    { _id: cart.customerId },
    { totalBuy: updatedTotalBuy, memberShip },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).json({ cart });
};

const transformCartItem = async (orderedProduct) => {
  const productsPromise = orderedProduct.map((item) => Product.findOne({ _id: item.productId }));
  const products = await Promise.all(productsPromise);
  return orderedProduct.map((item) => {
    const { _id, name, sale, type, rating, price } = products.find((prod) => prod._id.equals(item.productId));
    return {
      _id,
      name,
      sale,
      type,
      rating,
      price,
      quantity: item.quantity,
    };
  });
};

module.exports = {
  all,
  one,
  create,
  remove,
  finishCart,
};
