import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const filterStorage = (req, file, cb) => {
  if (
    file.mimetype === "image.jpg" ||
    file.mimetype === "image.jpeg" ||
    file.mimetype === "image.png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploads = multer({ storage: storage, filterStorage });

// File Size Formatter
export const fileSizeFormatter = (bytes, decimal) => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const dm = decimal || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1000));
  return (
    parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]
  );
};
