import multer from "multer";

const storage = multer.memoryStorage();

const limit = 4 * 1024 * 1024; // 4MB limit

const upload = multer({
  storage,
  limits: {
    fileSize: limit,
    fieldSize: limit,
  },
});

export { upload };
