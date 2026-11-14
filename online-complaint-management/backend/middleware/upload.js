const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { HttpError } = require('../utils/helpers');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Random file name, extension chosen from the verified MIME type (never from user input)
    const name = crypto.randomBytes(16).toString('hex');
    cb(null, `${name}${ALLOWED[file.mimetype]}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED[file.mimetype]) {
    return cb(new HttpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

// Delete a stored image (given its "/uploads/xxx.png" URL); ignores missing files
const removeImage = (imageUrl) => {
  if (!imageUrl) return;
  const filePath = path.join(uploadDir, path.basename(imageUrl));
  fs.unlink(filePath, () => {});
};

module.exports = { upload, removeImage };
