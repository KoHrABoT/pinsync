"use client";

import React, { useState, useEffect } from "react";
import Masonry from "./block/Components/Masonry/Masonry";
import { Download, User, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ImageModal from "./DetailModal";
import LoginPopup from "./LoginPopup";
import UploadPopup from "./uploadPopup";
import { motion } from "framer-motion";
import "./App.css";
import "./block/Components/Masonry/Masonry.css";

function MainSection({
  images,
  setImages,
  searchQuery,
  selectedCategory,
  userName, // Logged-in user passed from App.js
  handleDelete,
  setUserUploads,
}) {
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [isUploadPopupVisible, setIsUploadPopupVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [userLikes, setUserLikes] = useState([]);
  const SERVER_URL = "http://localhost:4000";

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/uploads`);
        if (!response.ok) throw new Error("Failed to fetch images");
        const uploads = await response.json();
        const formattedImages = uploads.map((upload) => ({
          id: upload._id,
          name: upload.name,
          category: upload.category,
          description: upload.description,
          src: `${SERVER_URL}${upload.src}`,
          uploader: upload.uploader,
          likeCount: upload.likeCount,
          downloads: upload.downloads,
          website: upload.website || null,
          uploadedAt: upload.uploadedAt,
          likedBy: upload.likedBy || [],
        }));
        setImages(formattedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    const fetchUserLikes = async () => {
      if (userName) {
        try {
          const response = await fetch(`${SERVER_URL}/users/username/${userName}`);
          if (!response.ok) throw new Error("Failed to fetch user data");
          const userData = await response.json();
          setUserLikes(userData.likedImages || []);
        } catch (error) {
          console.error("Error fetching user likes:", error);
        }
      }
    };

    fetchImages();
    fetchUserLikes();
  }, [userName, setImages]);

  const handleSave = async (image) => {
    if (!userName) {
      setIsLoginPopupVisible(true);
      return;
    }
    try {
      const response = await fetch(`${SERVER_URL}/uploads/${image.id}/download`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to update downloads");
      const data = await response.json();
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === image.id ? { ...img, downloads: data.upload.downloads } : img
        )
      );
      const link = document.createElement("a");
      link.href = image.src;
      link.download = `${image.name || "downloaded_image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error updating downloads:", error);
    }
  };

  const handleLike = async (imageId) => {
    if (!userName) {
      setIsLoginPopupVisible(true);
      return;
    }
    try {
      const response = await fetch(`${SERVER_URL}/uploads/${imageId}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (!response.ok) throw new Error("Failed to update likes");
      const data = await response.json();
      const newLikes = data.upload.likedBy.includes(userName)
        ? [...userLikes, imageId]
        : userLikes.filter((id) => id !== imageId);
      setUserLikes(newLikes);
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === imageId
            ? { ...img, likedBy: data.upload.likedBy, likeCount: data.upload.likeCount }
            : img
        )
      );
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesSearchQuery = searchQuery
      ? img.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : true;
    const matchesCategory = selectedCategory
      ? img.category?.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    return matchesSearchQuery && matchesCategory;
  });

  const selectedImage = selectedImageId ? images.find((img) => img.id === selectedImageId) : null;

  const toggleUploadPopup = () => setIsUploadPopupVisible(!isUploadPopupVisible);

  return (
    <div className="image-gallery-container">
      <Masonry>
        {filteredImages?.length > 0 ? (
          filteredImages.map((item) => (
            <div key={item.id} className="masonry-item">
              <div className="image-container" onClick={() => setSelectedImageId(item.id)}>
                <img src={item.src} alt={item.name} className="masonry-image" />
                <motion.div
                  className="hover-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  <motion.button
                    className="circle-btn save-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(item);
                    }}
                    whileHover={{ scale: 1.2, boxShadow: "0px 0px 10px rgba(255, 165, 0, 0.6)" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Download size={20} />
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      to={`/artist/${item.uploader}`} // Simplified to always use /artist/:userName
                      className="circle-btn profile-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <User size={20} />
                    </Link>
                  </motion.div>
                  <motion.button
                    className={`circle-btn like-btn ${item.likedBy?.includes(userName) ? "liked" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(item.id);
                    }}
                    whileHover={{ scale: 1.2, color: "red", boxShadow: "0px 0px 10px rgba(255, 0, 0, 0.6)" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.likedBy?.includes(userName) ? <Heart fill="red" size={20} /> : <Heart size={20} />}
                    <span className="like-count">{item.likeCount || 0}</span>
                  </motion.button>
                </motion.div>
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-site-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Site
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-images">No images found.</p>
        )}
      </Masonry>

      {isLoginPopupVisible && (
        <LoginPopup
          setUserName={() => {}} // These should be updated in App.js, not here
          setUserRole={() => {}}
          toggleLoginPopup={() => setIsLoginPopupVisible(false)}
        />
      )}

      {isUploadPopupVisible && (
        <UploadPopup
          toggleUploadPopup={toggleUploadPopup}
          setImages={setImages}
          setUserUploads={setUserUploads}
        />
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          uploader={{
            name: selectedImage?.uploader || "Unknown",
            photo: selectedImage?.uploaderProfile || "default-profile.png",
          }}
          title={selectedImage?.name || "Untitled"}
          description={selectedImage?.description || "No description provided"}
          onClose={() => setSelectedImageId(null)}
          handleLike={handleLike}
          userName={userName}
          website={selectedImage.website || null}
        />
      )}
    </div>
  );
}

export default MainSection;
