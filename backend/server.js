const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 4000;

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});

// Upload image endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No image uploaded",
    });
  }

  res.status(200).json({
    message: "Image uploaded successfully",
    filename: req.file.filename, 
    imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
  });
});

app.delete("/api/upload/:filename", (req, res) => {
  const filename = req.params.filename;

  const filePath = path.join(__dirname, "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "Image not found",
    });
  }

  fs.unlink(filePath, (error) => {
    if (error) {
      console.error("Error deleting image:", error);

      return res.status(500).json({
        message: "Failed to delete image",
      });
    }

    res.json({
      message: "Image deleted successfully",
    });
  });
});

// Get uploaded images
app.get("/api/upload", (req, res) => {
  const uploadFolder = path.join(__dirname, "uploads");

  fs.readdir(uploadFolder, (error, files) => {
    if (error) {
      console.error("Error reading uploads folder:", error);

      return res.status(500).json({
        message: "Failed to get uploaded images",
      });
    }

    const images = files.map((file) => ({
      filename: file,
      imageUrl: `http://localhost:${PORT}/uploads/${file}`,
    }));

    res.json(images);
  });
});



app.get("/", (req, res) => {
  res.json({
    message: "Week 3 Image Upload Backend is running",
  });
});

app.listen(PORT, () => {
  console.log(
    `Image Upload API running on http://localhost:${PORT}`
  );
});