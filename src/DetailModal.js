import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ImageModal = ({ image, uploader, title, description, onClose, handleLike, userName, website }) => {
  const navigate = useNavigate();

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const isLiked = image.likedBy?.includes(userName);
  const displayLikeCount = image.likeCount || 0;

  const handleUploaderClick = () => {
    if (!uploader?.name) {
      console.error("Uploader name is undefined or missing!");
      return;
    }
    if (userName && userName === uploader.name) {
      console.log("Navigating to ArtistProfile for:", uploader.name);
      navigate(`/artist/${uploader.name}`);
    } else {
      console.log("Navigating to ArtistProfileView for:", uploader.name);
      navigate(`/artist/view/${uploader.name}`);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-container-dynamic"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="image-section">
            <img src={image.src} alt={title} className="modal-image" />
          </div>
          <div className="details-section">
            <div className="uploader-info">
              <span
                className="uploader-name"
                onClick={handleUploaderClick}
                style={{ cursor: "pointer", color: "#1e90ff" }}
              >
                {uploader?.name || "Unknown Uploader"}
              </span>
            </div>
            <h1 className="modal-title">{title}</h1>
            <p className="modal-description">{description || "No description provided."}</p>
            <div className="like-section">
              <motion.button
                onClick={() => handleLike(image.id)}
                className={`like-btn ${isLiked ? "liked" : ""}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLiked ? "Unlike" : "Like"} <span className="like-count">({displayLikeCount})</span>
              </motion.button>
            </div>
            <motion.button
              onClick={handleShare}
              className="share-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Share
            </motion.button>
            {website && (
              <motion.a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-site-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Visit Site
              </motion.a>
            )}
            <motion.button
              onClick={onClose}
              className="close-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageModal;
