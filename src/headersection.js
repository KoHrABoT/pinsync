import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPopup from "./LoginPopup";
import UploadPopup from "./uploadPopup"; // Ensure case matches file name
import "./App.css";
import "boxicons/css/boxicons.min.css";

function Header({
  searchQuery,
  setSearchQuery,
  userName,
  userRole,
  setUserName,
  setUserRole,
  selectedCategory,
  setSelectedCategory,
  setImages,
  setUserUploads,
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [isUploadPopupVisible, setIsUploadPopupVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logging out user:", userName);
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setUserName("");
    setUserRole("normal");
  };

  const categories = [
    "All Categories",
    "Car",
    "Nature",
    "Mountains",
    "Technology",
    "Architecture",
    "Animals",
    "Sports",
    "Food",
    "Travel",
    "Art",
  ];

  const handleSelect = (category) => {
    setSelectedCategory(category === "All Categories" ? "" : category);
    setIsDropdownOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const toggleLoginPopup = () => setIsLoginPopupVisible((prev) => !prev);
  const toggleUploadPopup = () => {
    console.log("Toggling UploadPopup, props:", { setImages, setUserUploads });
    setIsUploadPopupVisible((prev) => !prev);
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } },
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <motion.div
        className="navbar-brand"
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Link to="/">Pinsync</Link>
      </motion.div>

      <div className="navbar-middle flex items-center gap-4">
        <motion.input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileFocus={{ scale: 1.05 }}
        />

        <div className="dropdown">
          <motion.button
            className="dropdown-toggle"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            whileHover={{ scale: 1.1, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            {selectedCategory || "Select Category"} ▼
          </motion.button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.ul
                className="dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {categories.map((category, index) => (
                  <motion.li
                    key={index}
                    className="dropdown-item"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(category)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {category}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="navbar-right flex items-center gap-4">
        <div className="dark-mode-toggle">
          <input type="checkbox" id="dark-toggle" checked={darkMode} onChange={toggleDarkMode} />
          <motion.label
            htmlFor="dark-toggle"
            className="toggle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={darkMode ? "bx bx-sun" : "bx bxs-sun"}></i>
            <i className={darkMode ? "bx bxs-moon" : "bx bx-moon"}></i>
            <motion.span
              className="ball"
              animate={{ x: darkMode ? 40 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </motion.label>
        </div>

        <motion.div
          className="navbar-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ul>
            <motion.li
              className="nav-item"
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Link className="nav-link" to="/">Home</Link>
            </motion.li>
            <motion.li
              className="nav-item"
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Link className="nav-link" to="/about">About</Link>
            </motion.li>
            {userRole === "admin" && (
              <motion.li
                className="nav-item"
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <Link className="nav-link" to="/admin">Admin Panel</Link>
              </motion.li>
            )}
            {userName && (userRole === "artist" || userRole === "normal") && (
              <motion.li
                className="nav-item"
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <Link className="nav-link" to="/profile">Profile</Link>
              </motion.li>
            )}
          </ul>
        </motion.div>

        {userName ? (
          <motion.div
            className="user-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <span className="welcome-text">Welcome, {userName}</span>
            {userRole === "artist" && (
              <motion.button
                className="upload-btn"
                onClick={toggleUploadPopup}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                Upload
              </motion.button>
            )}
            <motion.button
              className="logout-btn"
              onClick={handleLogout}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              Log Out
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            className="login-btn"
            onClick={toggleLoginPopup}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>
        )}
      </div>

      {isLoginPopupVisible && (
        <LoginPopup
          setUserName={setUserName}
          setUserRole={setUserRole}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}
      {isUploadPopupVisible && (
        <UploadPopup
          setImages={setImages}
          toggleUploadPopup={toggleUploadPopup}
          setUserUploads={setUserUploads}
        />
      )}
    </motion.nav>
  );
}

export default Header;
