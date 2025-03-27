import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";

const ArtistProfileView = ({ images, artistUsername }) => {
  const { username, userName } = useParams(); // Extract both possible params
  const profileUsername = artistUsername || username || userName; // Prioritize prop, then params
  const [artistData, setArtistData] = useState(null);
  const [artistImages, setArtistImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const SERVER_URL = "http://localhost:4000";

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        console.log("Profile username:", profileUsername);
        if (!profileUsername) {
          setError("No artist specified in the URL.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${SERVER_URL}/users/username/${profileUsername}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch artist data");
        }
        const data = await response.json();
        setArtistData(data);

        const filteredImages = (images || []).filter((img) => img.uploader === profileUsername);
        setArtistImages(filteredImages);
      } catch (error) {
        console.error("Error fetching artist profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [profileUsername, images]);

  if (loading) {
    return <div className="artist-profile-loading">Loading artist profile...</div>;
  }

  if (error) {
    return <div className="artist-profile-error">Error: {error}</div>;
  }

  if (!artistData) {
    return <div className="artist-profile-not-found">Artist not found</div>;
  }

  const totalLikes = artistImages.reduce((sum, img) => sum + (img.likeCount || 0), 0);
  const totalDownloads = artistImages.reduce((sum, img) => sum + (img.downloads || 0), 0);

  return (
    <div className="artist-profile-view">
      <h1>{artistData.username || "Unknown Artist"}'s Gallery</h1>
      <div className="profile-card">
        <div className="artist-header">
          <div className="artist-avatar">
            {artistData?.profileImage ? (
              <img src={artistData.profileImage} alt={`${artistData.username}'s profile`} />
            ) : (
              <div className="default-avatar">{artistData.username?.charAt(0)?.toUpperCase() || "?"}</div>
            )}
          </div>
          <div className="artist-info">
            {artistData.bio && <p className="artist-bio">{artistData.bio}</p>}
            {artistData.website && (
              <a
                href={artistData.website.startsWith("http") ? artistData.website : `https://${artistData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-website text-blue-500"
              >
                {artistData.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <motion.div className="stat-card" whileHover={{ scale: 1.1 }}>
          <h2>{artistImages.length}</h2>
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

      <section className="portfolio-section">
        <h2>Artist Gallery</h2>
        {artistImages.length > 0 ? (
          <div className="portfolio-gallery">
            {artistImages.map((image, index) => (
              <div key={image.id || `img-${index}`} className="portfolio-item">
                <img
                  src={image.src}
                  alt={image.name || "Untitled"}
                  className="portfolio-thumbnail"
                  onClick={() => window.open(image.src, "_blank")}
                  onError={(e) => (e.target.src = "/placeholder.svg")}
                />
                <div className="image-overlay">
                  <h3>{image.name || "Untitled"}</h3>
                  <div className="image-stats">
                    <span className="like-count">{image.likeCount || 0} likes</span>
                    <span className="download-count">{image.downloads || 0} downloads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-images">This artist hasn't uploaded any images yet.</p>
        )}
      </section>

      <style jsx="true">{`
        .artist-profile-view { padding: 20px; }
        .profile-card { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; }
        .artist-header { display: flex; align-items: center; gap: 20px; }
        .artist-avatar img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
        .default-avatar { width: 100px; height: 100px; border-radius: 50%; background-color: #ccc; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #fff; }
        .artist-info { flex: 1; }
        .artist-bio { margin: 10px 0; }
        .artist-website { font-size: 16px; }
        .profile-stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { padding: 15px; background-color: #f9f9f9; border-radius: 8px; text-align: center; width: 120px; }
        .stat-card h2 { margin: 0; font-size: 24px; }
        .stat-card p { margin: 5px 0 0; font-size: 14px; color: #666; }
        .portfolio-section { margin: 20px 0; }
        .portfolio-gallery { display: flex; flex-wrap: wrap; gap: 10px; }
        .portfolio-item { position: relative; width: 200px; height: 200px; }
        .portfolio-thumbnail { width: 100%; height: 100%; object-fit: cover; cursor: pointer; border-radius: 4px; }
        .image-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.6); color: white; padding: 10px; opacity: 0; transition: opacity 0.3s; }
        .portfolio-item:hover .image-overlay { opacity: 1; }
        .image-overlay h3 { margin: 0; font-size: 16px; }
        .image-stats { display: flex; justify-content: space-between; font-size: 12px; margin-top: 5px; }
        .no-images { color: #666; }
        .artist-profile-loading, .artist-profile-error, .artist-profile-not-found { padding: 20px; text-align: center; color: #666; }
        .artist-profile-error { color: #f44336; }
      `}</style>
    </div>
  );
};

export default ArtistProfileView;
