import React, { useState } from "react";

const UploadPopup = ({ toggleUploadPopup, setImages, setUserUploads }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  console.log("UploadPopup props:", { toggleUploadPopup, setImages, setUserUploads });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setFile(null);
    setWebsite("");
    setErrorMessage("");
  };

  const handleUpload = async () => {
    if (!file || !title || !category) {
      setErrorMessage("Please fill in all required fields and select an image.");
      return;
    }

    if (typeof setUserUploads !== "function") {
      console.error("setUserUploads is not a function. Check parent component props:", {
        setUserUploads,
      });
      setErrorMessage("Internal error: Unable to update uploads. Contact support.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("uploader", localStorage.getItem("userName") || "Unknown");
      if (website) formData.append("website", website);

      const response = await fetch("http://localhost:4000/uploads", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      console.log("Upload response status:", response.status, "Response text:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          throw new Error(errorData.message || "Upload failed");
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          throw new Error("Server returned an invalid response");
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Server response was not valid JSON");
      }

      const newImage = {
        id: data.upload._id,
        name: data.upload.name,
        category: data.upload.category,
        description: data.upload.description,
        src: `http://localhost:4000${data.upload.src}`,
        uploader: data.upload.uploader,
        likeCount: data.upload.likeCount || 0,
        downloads: data.upload.downloads || 0,
        website: data.upload.website || null,
        uploadedAt: data.upload.uploadedAt || new Date().toISOString(),
        likedBy: data.upload.likedBy || [],
      };

      setImages((prevImages) => [...prevImages, newImage]);
      setUserUploads((prevUploads) => {
        const userName = localStorage.getItem("userName") || "Unknown";
        const updatedUploads = { ...prevUploads };
        if (!updatedUploads[userName]) {
          updatedUploads[userName] = { uploads: [] };
        }
        updatedUploads[userName].uploads.push(newImage);
        localStorage.setItem("userUploads", JSON.stringify(updatedUploads));
        return updatedUploads;
      });

      resetForm();
      toggleUploadPopup();
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains unchanged
  return (
    <div className="upload-popup-overlay">
      <div className="upload-popup-content">
        <h2>Upload Media</h2>
        {errorMessage && (
          <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>
        )}
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={isLoading}
        >
          <option value="">Select Category</option>
          <option value="Car">Car</option>
          <option value="Nature">Nature</option>
          <option value="Mountains">Mountains</option>
          <option value="Technology">Technology</option>
          <option value="Architecture">Architecture</option>
          <option value="Animals">Animals</option>
          <option value="Sports">Sports</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Art">Art</option>
        </select>
        <textarea
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isLoading}
        />
        <input
          type="url"
          placeholder="Enter website URL (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={isLoading}
        />
        <button
          onClick={handleUpload}
          className="upload-btn"
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        <button
          className="close-btn"
          onClick={() => {
            resetForm();
            toggleUploadPopup();
          }}
          disabled={isLoading}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default UploadPopup;
