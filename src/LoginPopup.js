"use client";

import React, { useState } from "react";

const LoginPopup = ({ setUserName, setUserRole, toggleLoginPopup }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signUpUserName, setSignUpUserName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [userRole, setLocalUserRole] = useState("normal");
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Backend URL matching your old working code
  const SERVER_URL = "http://localhost:4000"; // No /api prefix, port 4000

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage("");
    resetFields();
  };

  const resetFields = () => {
    setLoginUserName("");
    setLoginPassword("");
    setSignUpUserName("");
    setSignUpEmail("");
    setSignUpPassword("");
    setPortfolioFiles([]);
    setErrorMessage("");
    setLocalUserRole("normal");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 3;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (files.length > maxImages) {
      setErrorMessage(`Please upload a maximum of ${maxImages} images.`);
      return;
    }

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isSizeValid = file.size <= maxSize;
      if (!isImage) {
        setErrorMessage(`${file.name} is not a valid image file.`);
        return false;
      }
      if (!isSizeValid) {
        setErrorMessage(`${file.name} exceeds the 5MB size limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setPortfolioFiles(validFiles);
      console.log("Portfolio files set:", validFiles);
    }
  };

  const handleSignUp = async () => {
    if (!signUpUserName || !signUpEmail || !signUpPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("username", signUpUserName);
      formData.append("email", signUpEmail);
      formData.append("password", signUpPassword);
      formData.append("role", userRole);

      if (userRole === "artist" && portfolioFiles.length > 0) {
        portfolioFiles.forEach((file) => {
          formData.append("portfolio", file); // Matches backend multer field name
        });
      }

      const response = await fetch(`${SERVER_URL}/users`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert(
        userRole === "artist"
          ? "Artist registration successful! Awaiting admin approval."
          : "Registration successful! You can now log in."
      );

      setIsSignUp(false);
      resetFields();
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginUserName || !loginPassword) {
      setErrorMessage("Please enter username and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const loginData = {
        username: loginUserName,
        password: loginPassword,
      };

      const response = await fetch(`${SERVER_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("userName", data.user.username);
      localStorage.setItem("userRole", data.user.role);

      setUserName(data.user.username);
      setUserRole(data.user.role);

      console.log("User logged in:", {
        id: data.user._id,
        username: data.user.username,
        role: data.user.role,
      });

      toggleLoginPopup();
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{isSignUp ? "Sign Up" : "Login"}</h2>

        {errorMessage && (
          <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
            {errorMessage}
          </div>
        )}

        {isSignUp ? (
          <>
            <input
              type="text"
              placeholder="Enter username"
              value={signUpUserName}
              onChange={(e) => setSignUpUserName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Enter email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter password (min. 6 characters)"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />
            <select value={userRole} onChange={(e) => setLocalUserRole(e.target.value)}>
              <option value="normal">Normal User</option>
              <option value="artist">Artist</option>
            </select>
            {userRole === "artist" && (
              <>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ marginTop: "10px" }}
                />
                <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  Upload up to 3 images (max 5MB each). Inappropriate content is prohibited.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter username"
              value={loginUserName}
              onChange={(e) => setLoginUserName(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </>
        )}
        <button
          className="login-btn"
          onClick={isSignUp ? handleSignUp : handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
        <p onClick={toggleSignUp} style={{ cursor: "pointer", color: "#ff758c" }}>
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </p>
        <button
          className="close-btn"
          onClick={() => {
            resetFields();
            toggleLoginPopup();
          }}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
