require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const authMiddleware = require("./authMiddleware");

const app = express();
const PORT = 4000;

const uploadFolder = path.join(__dirname, "uploads");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Get the current user's private image folder
const getUserFolder = (userId) => {
  const id = String(userId);

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error("Invalid user ID");
  }

  return path.join(uploadFolder, id);
};

// Check uploaded image type
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, GIF, and WEBP images are allowed."));
  }
};

// Store images inside the logged-in user's folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userFolder = getUserFolder(req.user.userId);

      fs.mkdirSync(userFolder, { recursive: true });

      cb(null, userFolder);
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Upload image (authentication required)
app.post("/api/upload", authMiddleware, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded"
      });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      filename: req.file.filename,
      imageUrl: `/api/upload/image/${req.file.filename}`
    });
  });
});

// List only the logged-in user's images
app.get("/api/upload", authMiddleware, (req, res) => {
  let userFolder;

  try {
    userFolder = getUserFolder(req.user.userId);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  fs.readdir(userFolder, (error, files) => {
    if (error && error.code === "ENOENT") {
      return res.json([]);
    }

    if (error) {
      return res.status(500).json({
        message: "Failed to get uploaded images"
      });
    }

    const images = files
      .filter((file) =>
        /^\d+-[0-9a-f-]+\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      )
      .map((file) => ({
        filename: file,
        imageUrl: `/api/upload/image/${file}`
      }));

    res.json(images);
  });
});

// View an image (authentication required)
app.get("/api/upload/image/:filename", authMiddleware, (req, res) => {
  const filename = req.params.filename;

  if (!/^\d+-[0-9a-f-]+\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
    return res.status(400).json({ message: "Invalid filename" });
  }

  let filePath;

  try {
    filePath = path.join(
      getUserFolder(req.user.userId),
      filename
    );
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  fs.access(filePath, fs.constants.R_OK, (error) => {
    if (error) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    res.sendFile(filePath);
  });
});

// Delete only the logged-in user's image
app.delete("/api/upload/:filename", authMiddleware, (req, res) => {
  const filename = req.params.filename;

  if (!/^\d+-[0-9a-f-]+\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
    return res.status(400).json({
      message: "Invalid filename"
    });
  }

  let filePath;

  try {
    filePath = path.join(
      getUserFolder(req.user.userId),
      filename
    );
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  fs.unlink(filePath, (error) => {
    if (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          message: "Image not found"
        });
      }

      return res.status(500).json({
        message: "Failed to delete image"
      });
    }

    res.json({
      message: "Image deleted successfully"
    });
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Week 3 Image Upload Backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`Image Upload API running on http://localhost:${PORT}`);
});