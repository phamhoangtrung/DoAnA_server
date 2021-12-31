const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Selection = require("../models/Selection");

const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");

// /product?page=1,
// /product?sort=-name
// /product?type=women
// /product?numericFilters=sale>3
// /products?type=men&numericFilters=rating>0&sort=-price

const all = async (req, res) => {
  const { type, name, sort, gender, fields, numericFilters } = req.query;
  const queryObject = {};
  if (type) queryObject.type = type;
  if (gender) queryObject.gender = gender;
  if (name) queryObject.name = { $regex: name, $options: "i" };
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`);
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let result = Product.find({ ...queryObject, isDelete: false });
  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  }
  result = result.sort({ createdAt: "desc" });

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  let totalProduct = await result;
  result = result.skip(skip).limit(limit);
  const products = await result;
  res.status(StatusCodes.OK).json({ products, total: totalProduct.length, pageSize: products.length });
};

const create = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const one = async ({ params: { id: _id } }, res) => {
  const product = await Product.findOne({ _id });
  if (!product) throw new NotFoundError(`No product with id : ${_id}`);
  res.status(StatusCodes.OK).json({ product });
};

const remove = async ({ params: { id: _id } }, res) => {
  const product = await Product.findOneAndUpdate(
    { _id },
    {
      isDelete: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!product) throw new NotFoundError(`No product with id : ${_id}`);
  res.status(StatusCodes.OK).json({ product });
};

const update = async ({ params: { id: _id }, body }, res) => {
  const product = await Product.findOneAndUpdate({ _id }, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new NotFoundError(`No product with id : ${_id}`);
  res.status(StatusCodes.OK).json({ product });
};

const getSelection = async (_, res) => {
  /** @type {Array<{name:string,value:string}>} */
  const selection = await Selection.find({});

  const data = selection.reduce((acc, cur) => {
    if (!acc[cur.name]) acc[cur.name] = [];
    return { ...acc, [cur.name]: [...acc[cur.name], cur.value] };
  }, {});

  res.json(data);
};

const addSelection = async (req, res) => {
  const data = await Selection.create(req.body.selection);
  res.send({ msg: "ok" });
};

const rating = async (req, res) => {
  const { product: prodRequest, _id: cartId } = req.body;
  const ids = prodRequest.map((p) => p._id);
  const prodCollection = await Product.find({
    _id: {
      $in: ids,
    },
  });
  prodCollection.forEach(async (pc) => {
    prodRequest.forEach(async (pr) => {
      if (pc._id.toString() === pr._id) {
        const updateData = calculateRating(pr.rating, pr.quantity, pc);

        await Product.findOneAndUpdate({ _id: pr._id }, updateData, {
          new: true,
          runValidators: true,
        });
      }
    });
  });
  console.log(cartId);

  await Cart.findOneAndUpdate(
    { _id: cartId },
    { isRated: true },
    {
      new: true,
      runValidators: true,
    }
  );

  res.send({ msg: "Success" });
};

const calculateRating = (rating, quantity, product) => {
  const newTotalSell = product.totalSell + quantity;
  const newRating = (product.rating * product.totalSell + rating * quantity) / newTotalSell;
  return {
    totalSell: newTotalSell,
    rating: newRating,
  };
};

module.exports = {
  one,
  all,
  create,
  update,
  remove,
  getSelection,
  rating,
  addSelection,
};
