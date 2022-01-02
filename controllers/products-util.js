const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Selection = require("../models/Selection");

const selection = {
  all: async (_, res) => {
    const selection = await Selection.find({});

    const data = selection.reduce((acc, cur) => {
      if (!acc[cur.name]) acc[cur.name] = [];
      return {
        ...acc,
        [cur.name]: [...acc[cur.name], cur.value],
      };
    }, {});

    res.json(data);
  },
  create: async (req, res) => {
    const data = await Selection.create(req.body.selection);
    res.send({
      msg: "ok",
    });
  },
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

        await Product.findOneAndUpdate(
          {
            _id: pr._id,
          },
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );
      }
    });
  });

  await Cart.findOneAndUpdate(
    {
      _id: cartId,
    },
    {
      isRated: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.send({
    msg: "Success",
  });
};

const calculateRating = (rating, quantity, product) => {
  const newTotalSell = product.totalSell + quantity;
  const newRating = (product.rating * product.totalSell + rating * quantity) / newTotalSell;
  return {
    totalSell: newTotalSell,
    rating: newRating,
  };
};

module.exports = { selection, rating };
