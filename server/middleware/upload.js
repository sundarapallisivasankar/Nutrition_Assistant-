import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// Setup local upload directory path
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration (Local storage as temporary/fallback space)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File Filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, jpeg, png, webp) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Middleware to handle image upload and optionally upload to Cloudinary
export const uploadImage = (fieldName) => {
  const multerUpload = upload.single(fieldName);

  return (req, res, next) => {
    multerUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return next();
      }

      try {
        if (isCloudinaryConfigured) {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'nutrition-assistant',
          });

          // Delete local temporary file
          fs.unlinkSync(req.file.path);

          // Replace local path with Cloudinary secure URL
          req.fileUrl = result.secure_url;
        } else {
          // Serve locally. Express will host public/ at root `/`
          // So file is accessible at `/uploads/filename`
          req.fileUrl = `/uploads/${req.file.filename}`;
        }
        next();
      } catch (error) {
        console.error('Upload middleware error:', error);
        // Fallback to local upload even if Cloudinary fails, just in case
        req.fileUrl = `/uploads/${req.file.filename}`;
        next();
      }
    });
  };
};
