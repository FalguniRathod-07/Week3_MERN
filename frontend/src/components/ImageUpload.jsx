
import { useEffect, useRef, useState } from "react";
import api from "../services/api";

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const fileInputRef = useRef(null);

  // Load only the logged-in user's images
  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadUploadedImages = async () => {
      try {
        const response = await api.get("/upload");

        if (!active) return;

        setUploadedImages(response.data);

        // Download images using authenticated requests
        const entries = await Promise.all(
          response.data.map(async (image) => {
            const imageResponse = await api.get(
              `/upload/image/${encodeURIComponent(image.filename)}`,
              { responseType: "blob" }
            );

            const objectUrl = URL.createObjectURL(imageResponse.data);
            objectUrls.push(objectUrl);

            return [image.filename, objectUrl];
          })
        );

        if (active) {
          setImageUrls(Object.fromEntries(entries));
        }
      } catch (error) {
        console.error("Error loading uploaded images:", error);
      }
    };

    loadUploadedImages();

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Select image and show preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  };

  // Upload image
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await api.post("/upload", formData);

      // Load the newly uploaded image securely
      const imageResponse = await api.get(
        `/upload/image/${encodeURIComponent(response.data.filename)}`,
        { responseType: "blob" }
      );

      const objectUrl = URL.createObjectURL(imageResponse.data);

      setUploadedImages((currentImages) => [
        ...currentImages,
        response.data,
      ]);

      setImageUrls((currentUrls) => ({
        ...currentUrls,
        [response.data.filename]: objectUrl,
      }));

      URL.revokeObjectURL(preview);
      setPreview("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed.");
    }
  };

  // Delete only the logged-in user's image
  const handleDelete = async (filename) => {
    try {
      await api.delete(
        `/upload/${encodeURIComponent(filename)}`
      );

      if (imageUrls[filename]) {
        URL.revokeObjectURL(imageUrls[filename]);
      }

      setUploadedImages((currentImages) =>
        currentImages.filter((image) => image.filename !== filename)
      );

      setImageUrls((currentUrls) => {
        const updated = { ...currentUrls };
        delete updated[filename];
        return updated;
      });

      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Image deletion failed.");
    }
  };

  return (
    <div className="image-upload">
      <h2>Upload Image</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />

      {preview && (
        <div>
          <h3>Preview</h3>
          <img src={preview} alt="Preview" width="250" />
        </div>
      )}

      <button className="upload-button" onClick={handleUpload}>
        Upload Image
      </button>

      {uploadedImages.length > 0 && (
        <div>
          <h3>Uploaded Images</h3>

          {uploadedImages.map((image) => (
            <div key={image.filename}>
              {imageUrls[image.filename] && (
                <img
                  src={imageUrls[image.filename]}
                  alt="Uploaded"
                  width="250"
                />
              )}

              <br />

              <button
                className="delete-image-button"
                onClick={() => handleDelete(image.filename)}
              >
                Delete Image
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
