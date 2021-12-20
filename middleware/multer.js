const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const type = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${type}`);
  },
});

var upload = multer({ storage: storage });

module.exports = upload;
