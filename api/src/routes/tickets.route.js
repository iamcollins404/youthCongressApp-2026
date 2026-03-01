const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
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

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file types based on field name
    if (file.fieldname === "passportPhoto") {
      const imageTypes = /jpeg|jpg|png|gif/;
      const mimetype = imageTypes.test(file.mimetype);
      const extname = imageTypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Passport photo must be an image file (JPG, PNG, GIF)"));
      }
    } else if (file.fieldname === "paymentProof") {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
      const mimetype =
        allowedTypes.test(file.mimetype) ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/msword" ||
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Payment proof must be an image, PDF, or Word document"));
      }
    } else {
      cb(new Error("Invalid field name"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all tickets (with pagination)
router.get("/", require("../controllers/tickets/allTickets.controller"));

// Create new ticket
router.post("/new", require("../controllers/tickets/newTicket.controller"));

// brute new ticket
router.post("/brute", require("../controllers/tickets/bruteticket"));

// Get admin dashboard stats
router.get("/admin/stats", require("../controllers/admin/stats.controller"));

// Create ticket by admin - now accepts file URLs
router.post(
  "/admin/create",
  require("../controllers/admin/createTicket.controller")
);

// Get specific ticket by ID
router.get(
  "/:id",
  require("../controllers/tickets/getSpecificTicket.controller")
);

// Update ticket STATUS and add comment
router.patch(
  "/:id/status",
  require("../controllers/admin/updateTicket.controller")
);

// Edit ticket details (admin only) - now accepts passport photo URL
router.patch(
  "/:id/edit",
  require("../controllers/admin/editTicket.controller")
);

// Update ticket image
router.patch(
  "/image",
  require("../controllers/tickets/updateTicketImage.controller")
);

module.exports = router;
