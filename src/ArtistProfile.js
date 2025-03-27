import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Masonry from "./block/Components/Masonry/Masonry";
import UploadPopup from "./uploadPopup";
import "./App.css";
import { Trash2 } from "lucide-react";

const ArtistProfile = ({ images = [], setImages, userName: propUserName, setUserUploads }) => {
  const { userName: urlUserName } = useParams();
  const userName = urlUserName || propUserName; // Profile being viewed
  const loggedInUser = propUserName; // Pass logged-in user as prop from App.js
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadPopupVisible, setIsUploadPopupVisible] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const SERVER_URL = "http://localhost:4000";

  useEffect(() => {
    fetchProfileData();
  }, [userName]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/users/username/${userName}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch profile");
      }
      const data = await response.json();
      setBio(data.bio || "");
      setWebsite(data.website || "");
      setPortfolio(data.portfolio || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification("error", error.message || "Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/users/username/${userName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, website }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save profile");
      }
      setIsEditing(false);
      showNotification("success", "Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("error", error.message || "Error saving profile");
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  const userImages = (images || []).filter((img) => img?.uploader === userName);
  const totalLikes = userImages.reduce((sum, img) => sum + (img.likeCount || 0), 0);
  const totalDownloads = userImages.reduce((sum, img) => sum + (img.downloads || 0), 0);

  const handleDeleteImage = (imageId) => {
    const updatedImages = images.filter((img) => img.id !== imageId);
    setImages(updatedImages);
    setUserUploads((prev) => {
      const updatedUploads = { ...prev };
      if (updatedUploads[userName]) {
        updatedUploads[userName].uploads = updatedUploads[userName].uploads.filter(
          (img) => img.id !== imageId
        );
        if (updatedUploads[userName].uploads.length === 0) delete updatedUploads[userName];
      }
      return updatedUploads;
    });
    showNotification("success", "Image deleted successfully");
  };

  const handleProfileClick = () => {
    const destination = loggedInUser === userName ? `/profile/${userName}` : `/artist/view/${userName}`;
    navigate(destination);
  };

  const toggleUploadPopup = () => setIsUploadPopupVisible(!isUploadPopupVisible);

  return (
    <div className="artist-profile">
      <h1>{userName}'s Profile</h1>
      {notification.show && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}
      <div className="profile-card">
        {isEditing ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter your website"
              className="w-full p-2 border rounded mt-2"
            />
            <button onClick={handleSaveProfile} className="save-profile-btn mt-2">
              Save
            </button>
          </>
        ) : (
          <>
            <p>{bio || "No bio added yet"}</p>
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                {website}
              </a>
            )}
            <button onClick={() => setIsEditing(true)} className="edit-btn mt-2 bg-gray-200 p-2 rounded">
              Edit Profile
            </button>
          </>
        )}
      </div>

      <section className="portfolio-section">
        <h2>Portfolio</h2>
        {isLoading ? (
          <p>Loading portfolio...</p>
        ) : portfolio.length > 0 ? (
          <div className="portfolio-gallery">
            {portfolio.map((img, imgIndex) => (
              <div key={imgIndex} className="portfolio-item">
                <img
                  src={`${SERVER_URL}${img.path}`}
                  alt={`${userName}'s portfolio ${imgIndex + 1}`}
                  className="portfolio-thumbnail"
                  onClick={() => window.open(`${SERVER_URL}${img.path}`, "_blank")}
                  onError={(e) => (e.target.src = "/placeholder.svg")}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No portfolio images available.</p>
        )}
      </section>

      <button onClick={toggleUploadPopup} className="upload-btn" style={{ margin: "10px" }}>
        Upload Artwork
      </button>

      <div className="profile-stats">
        <motion.div className="stat-card" whileHover={{ scale: 1.1 }}>
          <h2>{userImages.length}</h2>
          <p>Uploads</p>
        </motion.div>
        <motion.div className="stat-card" whileHover={{ scale: 1.1 }}>
          <h2>{totalLikes}</h2>
          <p>Total Likes</p>
        </motion.div>
        <motion.div className="stat-card" whileHover={{ scale: 1.1 }}>
          <h2>{totalDownloads}</h2>
          <p>Downloads</p>
        </motion.div>
      </div>

      <Masonry>
        {userImages.length > 0 ? (
          userImages.map((image) => (
            <motion.div key={image.id} className="masonry-item" whileHover={{ scale: 1.05 }}>
              <img src={image.src} alt={image.name} className="masonry-image" />
              <div className="image-name-overlay">
                <span>{image.name || "Untitled"}</span>
              </div>
              <motion.div
                className="like-count-overlay"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span>Likes: {image.likeCount || 0}</span>
                <span>Downloads: {image.downloads || 0}</span>
                <motion.button
                  className="profile-btn"
                  onClick={handleProfileClick}
                  whileHover={{ scale: 1.1 }}
                >
                  View Profile
                </motion.button>
              </motion.div>
              <button className="delete-btn" onClick={() => handleDeleteImage(image.id)}>
                <Trash2 size={20} />
              </button>
              {image.website && (
                <motion.a
                  href={image.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-site-btn"
                  onClick={(e) => e.stopPropagation()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Visit Site
                </motion.a>
              )}
            </motion.div>
          ))
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </Masonry>

      {isUploadPopupVisible && (
        <UploadPopup
          toggleUploadPopup={toggleUploadPopup}
          setImages={setImages}
          setUserUploads={setUserUploads}
        />
      )}

      <style jsx="true">{`
        .portfolio-section { margin: 20px 0; }
        .portfolio-gallery { display: flex; flex-wrap: wrap; gap: 10px; }
        .portfolio-item { width: 100px; height: 100px; }
        .portfolio-thumbnail { width: 100%; height: 100%; object-fit: cover; cursor: pointer; border-radius: 4px; }
        .upload-btn { padding: 8px 16px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .upload-btn:hover { background-color: #45a049; }
        .notification { position: fixed; top: 20px; right: 20px; padding: 10px 20px; border-radius: 4px; color: white; z-index: 1000; }
        .notification.success { background-color: #4caf50; }
        .notification.error { background-color: #f44336; }
        .profile-btn { padding: 5px 10px; background-color: #1e90ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px; }
      `}</style>
    </div>
  );
};

export default ArtistProfile;
