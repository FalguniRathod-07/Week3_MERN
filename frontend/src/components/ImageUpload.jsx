import { useEffect, useRef, useState } from "react";
import axios from "axios";

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Load uploaded image when page opens or refreshes
  useEffect(() => {
    const loadUploadedImage = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/upload"
        );
        setUploadedImages(response.data);
      } catch (error) {
        console.error("Error loading uploaded image:", error);
      }
    };

    loadUploadedImage();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    const imagePreview = URL.createObjectURL(file);
    setPreview(imagePreview);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/upload",
        formData
      );

      setUploadedImages((currentImages) => [
      ...currentImages,
       response.data,
      ]);

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
  
   const handleDelete = async (filename) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/upload/${encodeURIComponent(
          filename
        )}`
      );

      setUploadedImages((currentImages) =>
        currentImages.filter(
          (image) => image.filename !== filename
        )
      );

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
        accept="image/*"
        onChange={handleFileChange}
      />

      {preview && (
        <div>
          <h3>Preview</h3>

          <img
            src={preview}
            alt="Preview"
            width="250"
          />
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
         <img
          src={image.imageUrl}
          alt="Uploaded"
          width="250"
         />

         <br />

         <button
          className="delete-image-button"
          onClick={() => handleDelete(image.filename)}
         > Delete Image </button>
         </div>
        ))}
       </div>
      )}

       
    </div>
  );
}

export default ImageUpload;