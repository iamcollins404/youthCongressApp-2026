const express = require("express");
const router = express.Router();
const uploadFileController = require("../controllers/uploads/uploadFile.controller");
const uploadToForUploadsController = require("../controllers/uploads/uploadToForUploads.controller");

// POST /api/uploads/file - Upload to ForUploads (requires FORUPLOADS_API_KEY in .env)
router.post("/file", uploadToForUploadsController);

// POST /api/uploads/file/local - Upload to local server storage (fallback)
router.post("/file/local", uploadFileController);

module.exports = router;
