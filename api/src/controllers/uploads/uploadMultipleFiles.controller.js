const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../../uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload for multiple files
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file types
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("File type not supported"));
    }
  },
}).fields([
  { name: "passportPhoto", maxCount: 1 },
  { name: "paymentProof", maxCount: 1 },
]); // Accept both passportPhoto and paymentProof fields

module.exports = upload;
