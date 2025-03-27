// PinterestGallery.js
import React from "react";
import { motion } from "framer-motion";
import { Download, User, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const PinterestGallery = ({ images, handleSave, handleLike, likes, setSelectedImage }) => {
  return (
    <div className="pinterest-gallery">
      {images.length > 0 ? (
        images.map((image) => (
          <motion.div
            key={image.id}
            className="gallery-item"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={image.src}
              alt={image.name}
              onClick={() => setSelectedImage(image)}
              style={{ cursor: "pointer" }}
              loading="lazy" // Optimize loading for performance
            />
            <div className="hover-buttons">
              <button className="circle-btn save-btn" onClick={() => handleSave(image)}>
                <Download size={20} />
              </button>
              <Link to={`/artist/${image.uploader}`} className="circle-btn profile-btn">
                <User size={20} />
              </Link>
              <button
                className={`circle-btn like-btn ${likes[image.id] ? "liked" : ""}`}
                onClick={() => handleLike(image.id)}
              >
                {likes[image.id] ? <Heart fill="red" size={20} /> : <Heart size={20} />}
                <span className="like-count">{image.likeCount || 0}</span>
              </button>
            </div>
          </motion.div>
        ))
      ) : (
        <p>No images uploaded yet.</p>
      )}
    </div>
  );
};

export default PinterestGallery;
