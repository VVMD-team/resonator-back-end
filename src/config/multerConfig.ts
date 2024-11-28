import multer from "multer";

const storage = multer.memoryStorage();

const limit = 10 * 1024 * 1024; // 10mb limit

const upload = multer({
  storage,
  limits: {
    fileSize: limit,
    fieldSize: limit,
  },
});

export { upload };
