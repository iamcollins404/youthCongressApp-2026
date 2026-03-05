require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const multer = require('multer');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const FORUPLOADS_API = 'https://api.foruploads.com/v1';

// Use memory storage so we can forward the buffer to ForUploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File type not supported'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('file');

const uploadToForUploads = async (req, res) => {
  const apiKey = process.env.FORUPLOADS_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return res.status(500).json({
      success: false,
      message: 'ForUploads API key not configured. Set FORUPLOADS_API_KEY in .env',
    });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    try {
      const form = new FormData();
      form.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(`${FORUPLOADS_API}/files/upload`, form, {
        headers: {
          apiKey: apiKey.trim(),
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      const data = response.data || {};

      // ForUploads may return { url }, { file: { url } }, { fileId }, etc.
      const fileUrl =
        data.url ||
        data.file?.url ||
        data.fileUrl ||
        (data.fileId ? `${FORUPLOADS_API}/files/${data.fileId}` : null);

      if (!fileUrl) {
        console.warn('ForUploads response:', data);
        return res.status(500).json({
          success: false,
          message: 'Upload succeeded but no file URL returned. Check ForUploads API response format.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      });
    } catch (fetchErr) {
      console.error('ForUploads upload error:', fetchErr);
      const errData = fetchErr.response?.data || {};
      res.status(fetchErr.response?.status || 500).json({
        success: false,
        message: errData.error || fetchErr.message || 'Upload failed',
      });
    }
  });
};

module.exports = uploadToForUploads;
