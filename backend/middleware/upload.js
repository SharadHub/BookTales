const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = 'uploads/books/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + '.jpg'); // Always save as JPG for consistency
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, GIF, and WebP files are allowed'), false);
  }
};

const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = inputPath.replace(/\.[^/.]+$/, '.jpg');
    
    // Process image with Sharp for high quality and optimization
    await sharp(inputPath)
      .resize(400, 600, { // Standard book cover dimensions
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true // Don't upscale small images
      })
      .jpeg({
        quality: 90, // High quality setting
        progressive: true // Progressive JPEG for better loading
      })
      .toFile(outputPath);

    // Remove original file if it's different from processed file
    if (inputPath !== outputPath) {
      fs.unlinkSync(inputPath);
    }

    // Update file info
    req.file.filename = path.basename(outputPath);
    req.file.path = outputPath;
    req.file.mimetype = 'image/jpeg';
    
    next();
  } catch (error) {
    // If processing fails, remove the uploaded file and pass error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Increased to 10MB for high-quality source images
});

// Export both single upload (required) and optional upload with image processing
const uploadSingle = (req, res, next) => {
  upload.single('coverImage')(req, res, (err) => {
    if (err) return next(err);
    processImage(req, res, next);
  });
};

const uploadOptional = (req, res, next) => {
  upload.single('coverImage')(req, res, (err) => {
    if (err) return next(err);
    processImage(req, res, next);
  });
};

module.exports = {
  upload: uploadSingle,
  optional: uploadOptional
};
