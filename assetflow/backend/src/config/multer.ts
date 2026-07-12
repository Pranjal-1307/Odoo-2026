import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './index';

// Ensure directories exist
if (!fs.existsSync(config.upload.photosDir)) {
  fs.mkdirSync(config.upload.photosDir, { recursive: true });
}
if (!fs.existsSync(config.upload.documentsDir)) {
  fs.mkdirSync(config.upload.documentsDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.photosDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.documentsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const photoFilter = (_req: any, file: any, cb: any) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, JPG, PNG and WEBP image files are allowed!'), false);
};

const documentFilter = (_req: any, file: any, cb: any) => {
  const filetypes = /pdf|doc|docx/;
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC and DOCX document files are allowed!'), false);
};

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).single('photo');

export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).single('document');
