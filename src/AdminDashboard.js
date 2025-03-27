"use client";

import { useState, useEffect, useCallback } from "react";
import "./App.css";

const AdminDashboard = ({ userUploads, setUserUploads }) => {
  const [pendingArtists, setPendingArtists] = useState([]);
  const [approvedArtists, setApprovedArtists] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const SERVER_URL = "http://localhost:4000";

  const safeUserUploads = userUploads || {};

  useEffect(() => {
    fetchPendingArtists();
  }, []);

  const fetchPendingArtists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        const pending = data.filter((artist) => artist.role === "artist" && !artist.approved);
        const approved = data.filter((artist) => artist.role === "artist" && artist.approved);
        setPendingArtists(pending);
        setApprovedArtists(approved);
      } else {
        showNotification("error", "Failed to fetch artists");
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
      showNotification("error", "Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  const handleApprove = async (artist, approved) => {
    setIsLoading(true);
    try {
      const adminId = localStorage.getItem("userId");
      const response = await fetch(`${SERVER_URL}/users/${artist._id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved, adminId }),
      });
      const data = await response.json();

      if (response.ok) {
        if (approved) {
          setPendingArtists((prev) => prev.filter((a) => a._id !== artist._id));
          setApprovedArtists((prev) => [...prev, data.user]);
          showNotification("success", `Artist ${artist.username} approved`);
        } else {
          setPendingArtists((prev) => prev.filter((a) => a._id !== artist._id));
          showNotification("success", `Artist ${artist.username} rejected`);
        }
      } else {
        showNotification("error", data.message || "Failed to update artist");
      }
    } catch (error) {
      console.error("Error updating artist:", error);
      showNotification("error", "Server error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      setIsLoading(true);
      try {
        const adminId = localStorage.getItem("userId");
        const userToDelete = approvedArtists.find((artist) => artist.username === username);
        const response = await fetch(`${SERVER_URL}/users/${userToDelete._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId }),
        });
        const data = await response.json();

        if (response.ok) {
          setApprovedArtists((prev) => prev.filter((artist) => artist.username !== username));
          if (typeof setUserUploads === "function") {
            const updatedUploads = { ...safeUserUploads };
            delete updatedUploads[username];
            setUserUploads(updatedUploads);
          }
          showNotification("success", `User ${username} deleted`);
          await fetchPendingArtists();
        } else {
          showNotification("error", data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("error", "Failed to delete user");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteUpload = (username, uploadIndex) => {
    if (window.confirm("Are you sure you want to delete this upload?")) {
      if (typeof setUserUploads === "function") {
        const updatedUploads = { ...safeUserUploads };
        if (updatedUploads[username] && updatedUploads[username].uploads) {
          updatedUploads[username].uploads.splice(uploadIndex, 1);
          localStorage.setItem("userUploads", JSON.stringify(updatedUploads));
          setUserUploads(updatedUploads);
        }
      }
      showNotification("success", "Upload deleted successfully");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing request...</p>
        </div>
      )}
      <section className="dashboard-section">
        <h2>Pending Artist Requests</h2>
        <button onClick={fetchPendingArtists} className="refresh-btn">Refresh Requests</button>
        {pendingArtists.length > 0 ? (
          <ul className="artists-list">
            {pendingArtists.map((artist) => (
              <li key={artist._id} className="artist-item">
                <div className="artist-info">
                  <p><strong>Username:</strong> {artist.username}</p>
                  <p><strong>Submitted:</strong> {new Date(artist.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="portfolio-section">
                  <p><strong>Portfolio:</strong></p>
                  <div className="portfolio-gallery">
                    {artist.portfolio && artist.portfolio.length > 0 ? (
                      artist.portfolio.map((img, imgIndex) => (
                        <div key={imgIndex} className="portfolio-item">
                          <img
                            src={`${SERVER_URL}${img.path}`}
                            alt={`${artist.username}'s portfolio ${imgIndex + 1}`}
                            className="portfolio-thumbnail"
                            onClick={() => window.open(`${SERVER_URL}${img.path}`, "_blank")}
                            onError={(e) => (e.target.src = "/placeholder.svg")}
                          />
                        </div>
                      ))
                    ) : (
                      <p>No portfolio images available.</p>
                    )}
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="approve-btn" onClick={() => handleApprove(artist, true)} disabled={isLoading}>
                    Approve
                  </button>
                  <button className="reject-btn" onClick={() => handleApprove(artist, false)} disabled={isLoading}>
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending artist requests.</p>
        )}
      </section>
      <section className="dashboard-section">
        <h2>Approved Artists</h2>
        {approvedArtists.length > 0 ? (
          <ul className="artists-list">
            {approvedArtists.map((artist) => (
              <li key={artist._id} className="artist-item">
                <div className="artist-info">
                  <p><strong>Username:</strong> {artist.username}</p>
                  <p><strong>Approved:</strong> {new Date(artist.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="portfolio-section">
                  <p><strong>Portfolio:</strong></p>
                  <div className="portfolio-gallery">
                    {artist.portfolio && artist.portfolio.length > 0 ? (
                      artist.portfolio.map((img, imgIndex) => (
                        <div key={imgIndex} className="portfolio-item">
                          <img
                            src={`${SERVER_URL}${img.path}`}
                            alt={`${artist.username}'s portfolio ${imgIndex + 1}`}
                            className="portfolio-thumbnail"
                            onClick={() => window.open(`${SERVER_URL}${img.path}`, "_blank")}
                            onError={(e) => (e.target.src = "/placeholder.svg")}
                          />
                        </div>
                      ))
                    ) : (
                      <p>No portfolio images available.</p>
                    )}
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="delete-user-btn" onClick={() => handleDeleteUser(artist.username)}>
                    Delete User
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No approved artists yet.</p>
        )}
      </section>
      <section className="dashboard-section">
        <div className="section-header">
          <h2>User Uploads</h2>
          <button
            className="refresh-btn"
            onClick={() => {
              if (typeof setUserUploads === "function") {
                setUserUploads(JSON.parse(localStorage.getItem("userUploads")) || {});
              }
            }}
          >
            Refresh Uploads
          </button>
        </div>
        {Object.keys(safeUserUploads).length > 0 ? (
          <ul className="uploads-list">
            {Object.keys(safeUserUploads).map((username) => (
              <li key={username} className="uploads-item">
                <h3>{username}'s Uploads</h3>
                {safeUserUploads[username]?.uploads?.length > 0 ? (
                  <div className="uploads-gallery">
                    {safeUserUploads[username].uploads.map((upload, uploadIndex) => (
                      <div key={uploadIndex} className="upload-item">
                        <img
                          src={upload.src}
                          alt={`${username}'s upload: ${upload.name || "Untitled"}`}
                          className="upload-thumbnail"
                          onClick={() => window.open(upload.src, "_blank")}
                          onError={(e) => (e.target.src = "/placeholder.svg")}
                        />
                        <div className="upload-info">
                          <p className="upload-title">{upload.name || "Untitled"}</p>
                          <p className="upload-date">
                            {new Date(upload.uploadedAt || Date.now()).toLocaleDateString()}
                          </p>
                          <button
                            className="delete-upload-btn"
                            onClick={() => handleDeleteUpload(username, uploadIndex)}
                          >
                            Delete Upload
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No uploads from this user yet.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-uploads">
            <p>No user uploads available.</p>
            <p className="small-text">Try clicking the refresh button above.</p>
          </div>
        )}
      </section>
      <style jsx="true">{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .refresh-btn {
          padding: 8px 16px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .refresh-btn:hover {
          background-color: #45a049;
        }
        .no-uploads {
          text-align: center;
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .small-text {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
        .approve-btn {
          padding: 6px 12px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        .approve-btn:hover {
          background-color: #45a049;
        }
        .reject-btn {
          padding: 6px 12px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .reject-btn:hover {
          background-color: #da190b;
        }
        .delete-user-btn {
          padding: 6px 12px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-user-btn:hover {
          background-color: #da190b;
        }
        .portfolio-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .portfolio-item {
          width: 100px;
          height: 100px;
        }
        .portfolio-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
