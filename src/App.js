import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./headersection";
import MainSection from "./mainsection";
import ArtistProfile from "./ArtistProfile";
import ArtistProfileView from "./ArtistProfileView";
import NormalUserProfile from "./NormalUserProfile";
import AdminDashboard from "./AdminDashboard";
import About from "./About";
import LoginPopup from "./LoginPopup";
import "./App.css";

export default function App() {
  const [images, setImages] = useState([]);
  const [userUploads, setUserUploads] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userName, setUserName] = useState(""); // Logged-in user
  const [userRole, setUserRole] = useState("normal"); // Default to "normal"
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const SERVER_URL = "http://localhost:4000";

  // Fetch initial data and verify logged-in user
  useEffect(() => {
    const initializeApp = async () => {
      // Fetch images from server
      try {
        const response = await fetch(`${SERVER_URL}/uploads`);
        if (response.ok) {
          const uploads = await response.json();
          const formattedImages = uploads.map((upload) => ({
            id: upload._id,
            name: upload.name,
            category: upload.category,
            description: upload.description,
            src: `${SERVER_URL}${upload.src}`,
            uploader: upload.uploader,
            likeCount: upload.likeCount || 0,
            downloads: upload.downloads || 0,
            website: upload.website || null,
            uploadedAt: upload.uploadedAt,
            likedBy: upload.likedBy || [],
          }));
          setImages(formattedImages);
        } else {
          console.error("Failed to fetch images:", response.status);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }

      // Check logged-in user
      const storedUserName = localStorage.getItem("userName"); // Temporary; replace with token
      if (storedUserName) {
        try {
          const response = await fetch(`${SERVER_URL}/users/username/${storedUserName}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserName(storedUserName);
            setUserRole(userData.role || "normal");
          } else {
            console.log("User not found or invalid session, clearing localStorage");
            localStorage.removeItem("userName");
            localStorage.removeItem("userRole");
            setUserName("");
            setUserRole("normal");
          }
        } catch (error) {
          console.error("Error verifying user:", error);
          setUserName("");
          setUserRole("normal");
        }
      }
    };

    initializeApp();
  }, []);

  // Handle delete function
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${SERVER_URL}/uploads/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setImages(images.filter((media) => media.id !== id));
        setUserUploads((prevUploads) => {
          const updatedUploads = { ...prevUploads };
          for (const user in updatedUploads) {
            updatedUploads[user].uploads = updatedUploads[user].uploads.filter((img) => img.id !== id);
            if (updatedUploads[user].uploads.length === 0) {
              delete updatedUploads[user];
            }
          }
          return updatedUploads;
        });
      } else {
        console.error("Failed to delete image on server:", response.status);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Authentication check
  const isAuthenticated = !!userName;

  return (
    <Router>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={userName}
        userRole={userRole}
        setUserName={setUserName}
        setUserRole={setUserRole}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        images={images}
        setImages={setImages}
        setUserUploads={setUserUploads}
        setIsLoginPopupVisible={setIsLoginPopupVisible}
      />
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <MainSection
              images={images}
              setImages={setImages}
              handleDelete={handleDelete}
              userName={userName}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              setUserUploads={setUserUploads}
            />
          }
        />

        {/* About Page */}
        <Route path="/about" element={<About />} />

        {/* User Profile (Authenticated Users Only) */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              userRole === "artist" ? (
                <ArtistProfile
                  userName={userName}
                  images={images}
                  setImages={setImages}
                  setUserUploads={setUserUploads}
                />
              ) : userRole === "normal" ? (
                <NormalUserProfile userName={userName} images={images} />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Artist Profile (Editable for Artist, View-Only for Others) */}
        <Route
          path="/artist/:userName"
          element={
            <ArtistProfileRoute
              loggedInUser={userName}
              images={images}
              setImages={setImages}
              setUserUploads={setUserUploads}
            />
          }
        />

        {/* View-Only Artist Profile */}
        <Route
          path="/artist/view/:username"
          element={<ArtistProfileView images={images} />}
        />

        {/* Admin Dashboard (Admin Only) */}
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isLoginPopupVisible && (
        <LoginPopup
          setUserName={setUserName}
          setUserRole={setUserRole}
          toggleLoginPopup={() => setIsLoginPopupVisible(false)}
        />
      )}
    </Router>
  );
}

// Custom component to handle /artist/:userName routing logic
function ArtistProfileRoute({ loggedInUser, images, setImages, setUserUploads }) {
  const { userName } = useParams(); // Extract the :userName param from the URL

  if (loggedInUser === userName) {
    return (
      <ArtistProfile
        userName={userName}
        images={images}
        setImages={setImages}
        setUserUploads={setUserUploads}
      />
    );
  } else {
    return <ArtistProfileView images={images} />;
  }
}
