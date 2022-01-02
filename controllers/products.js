const Product = require("../models/Product");
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
  // check filter
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
    // check numericFilters in query
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
  const limit = Number(req.query.limit) || 12; //default 12 item/page
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
  const product = await Product.findOneAndUpdate({ _id }, { isDelete: true, }, {
    new: true,
    runValidators: true,
  });

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

module.exports = {
  one,
  all,
  create,
  update,
  remove,
};
