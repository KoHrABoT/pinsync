import React, { useState, useEffect } from "react";
import "./App.css"; // Add styles

const NormalUserProfile = ({ userName, images }) => {
  const [likedImages, setLikedImages] = useState([]);

  useEffect(() => {
    // Filter images to find those liked by the current user
    const userLikedImages = images.filter((image) =>
      image.likedBy?.includes(userName)
    );
    setLikedImages(userLikedImages);
  }, [images, userName]); // Re-run when images or userName changes

  return (
    <div className="profile-container">
      <h1>{userName}'s Profile</h1>

      {/* Liked Images Section */}
      <h2>Liked Images</h2>
      <div className="pinterest-gallery">
        {likedImages.length > 0 ? (
          likedImages.map((image, index) => (
            <div key={index} className="pinterest-item">
              <img src={image.src} alt={image.name} />
            </div>
          ))
        ) : (
          <p>No images liked yet.</p>
        )}
      </div>
    </div>
  );
};

export default NormalUserProfile;
