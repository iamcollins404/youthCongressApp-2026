const express = require("express");
const router = express.Router();
const uploadFileController = require("../controllers/uploads/uploadFile.controller");

// POST /api/uploads/file - Upload a file
router.post("/file", uploadFileController);

module.exports = router;
