const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const Image = require("../models/Image");

const one = async (req, res) => {
  const img = await Image.findById(req.params.id);
  if (!img) throw new NotFoundError("No photo Found");
  res.status(StatusCodes.OK).contentType("image/jpeg").end(img.data);
};

const create = async (req, res) => {
  const { mimetype, data } = req.files.file;
  const type = mimetype.split("/")[1];
  const img = await Image.create({ type, data });
  const filename = `${req.protocol}://${req.get("host")}/photo/${img._id}`;
  res.status(StatusCodes.OK).send({ type, filename });
};

module.exports = { one, create };
