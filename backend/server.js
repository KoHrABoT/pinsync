const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// CORS middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/pinsyncDatabase"; // Standardized to lowercase
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, default: "normal" },
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  likedImages: { type: [String], default: [] },
  portfolio: { type: [{ filename: String, path: String }], default: [] },
});

const User = mongoose.model("User", userSchema);

// Upload Schema
const uploadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  src: { type: String, required: true },
  uploader: { type: String, required: true },
  likeCount: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  website: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  likedBy: { type: [String], default: [] },
});

const Upload = mongoose.model("Upload", uploadSchema);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ronak1122chaudhari@gmail.com",
    pass: "jemi.rk@0412", // Use an App Password if 2FA is enabled
  },
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Fixed template literal
  },
});
const upload = multer({ storage });

// Send email notification
const sendEmailNotification = async (toEmail, username, approved) => {
  const subject = approved ? "Artist Request Approved" : "Artist Request Rejected";
  const text = approved
    ? `Dear ${username},\n\nYour artist request has been approved! You can now log in and start uploading your artwork.\n\nBest regards,\nArt Platform Team`
    : `Dear ${username},\n\nYour artist request has been rejected. If you have any questions, please contact support.\n\nBest regards,\nArt Platform Team`;

  try {
    await transporter.sendMail({
      from: '"Art Platform" <ronak1122chaudhari@gmail.com>',
      to: toEmail,
      subject,
      text,
    });
    console.log(`Email sent to ${toEmail} for ${approved ? "approval" : "rejection"}`); // Fixed template literal
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error); // Fixed template literal
  }
};

// Define routes
const router = express.Router();
router.use(express.urlencoded({ extended: true }));

// User registration
router.post("/users", upload.array("portfolio", 10), async (req, res) => {
  console.log(req.body);
  console.log("Received registration request - Body:", req.body, "Files:", req.files);
  try {
    const { username, email, password, role = "normal" } = req.body;

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ message: "Username and password are required" });
    }

    console.log("Checking for existing user:", username);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username already exists:", username);
      return res.status(400).json({ message: "Username already exists" });
    }

    console.log("Processing portfolio files");
    const portfolio = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          path: `/uploads/${file.filename}`, // Fixed string literal
        }))
      : [];

    console.log("Creating new user");
    const newUser = new User({
      username,
      email,
      password, // TODO: Hash this in production
      role,
      approved: role === "artist" ? false : true,
      portfolio,
    });

    console.log("Saving new user to database");
    await newUser.save();
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    console.log("User registered successfully:", username);
    res.status(201).json({
      message: role === "artist" ? "Artist registration successful, awaiting admin approval" : "Registration successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code, // For MongoDB errors
    });
    res.status(500).json({ message: "Server error during registration" });
  }
});

// User login
router.post("/users/login", express.json(), async (req, res) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      console.log("Login failed: Invalid credentials for", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log("Sending users:", users);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get user by ID
router.get("/users/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Sending user by username:", user);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update user (e.g., likedImages)
router.put("/users/:id", async (req, res) => {
  try {
    const { likedImages } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (likedImages) {
      user.likedImages = likedImages;
    }

    await user.save();
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ message: "User updated", user: userWithoutPassword });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Approve/reject artist
router.put("/users/:id/approve", async (req, res) => {
  console.log("Received approval request:", req.params, req.body);
  try {
    const { id } = req.params;
    const { approved, adminId } = req.body;

    if (approved === undefined) {
      return res.status(400).json({ message: "Approved status is required" });
    }

    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "artist") {
      return res.status(400).json({ message: "Only artist accounts can be approved/rejected" });
    }

    user.approved = approved;
    await user.save();

    await sendEmailNotification(user.email, user.username, approved);
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      message: approved ? "Artist approved" : "Artist rejected",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Error updating approval status" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  console.log("Received delete request:", req.params, req.body);
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      message: `User ${userWithoutPassword.username} deleted successfully`, // Fixed template literal
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Upload image
router.post("/uploads", upload.single("file"), async (req, res) => {
  console.log("Received upload request - File:", req.file);
  try {
    const { name, category, description, website, uploader } = req.body;

    if (!req.file || !name || !category || !uploader) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newUpload = new Upload({
      name,
      category,
      description,
      src: `/uploads/${req.file.filename}`, // Fixed string literal
      uploader,
      website,
    });

    await newUpload.save();
    res.status(201).json({ message: "Upload successful", upload: newUpload });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

// Fetch all uploads
router.get("/uploads", async (req, res) => {
  try {
    const uploads = await Upload.find();
    console.log("Sending uploads:", uploads);
    res.json(uploads);
  } catch (error) {
    console.error("Error fetching uploads:", error);
    res.status(500).json({ message: "Error fetching uploads" });
  }
});

// Update likes for an upload
router.put("/uploads/:id/like", async (req, res) => {
  try {
    const { userName } = req.body;
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    const isLiked = upload.likedBy.includes(userName);
    if (isLiked) {
      upload.likedBy = upload.likedBy.filter((name) => name !== userName);
      upload.likeCount -= 1;
    } else {
      upload.likedBy.push(userName);
      upload.likeCount += 1;
    }

    await upload.save();
    res.json({ message: "Like updated", upload });
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ message: "Error updating like" });
  }
});

// Update downloads for an upload
router.put("/uploads/:id/download", async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    upload.downloads += 1;
    await upload.save();
    res.json({ message: "Download updated", upload });
  } catch (error) {
    console.error("Error updating download:", error);
    res.status(500).json({ message: "Error updating download" });
  }
});

router.delete("/uploads/:id", async (req, res) => {
  try {
    const upload = await Upload.findByIdAndDelete(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }
    res.json({ message: "Upload deleted successfully" });
  } catch (error) {
    console.error("Error deleting upload:", error);
    res.status(500).json({ message: "Error deleting upload" });
  }
});


// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register all routes
app.use("/", router);

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ message: "Unexpected server error" });
});

// Catch-all route
app.use((req, res) => {
  console.log("Caught by catch-all route:", req.method, req.url);
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Fixed template literal
  console.log("Available routes:");
  console.log("POST /users - Register");
  console.log("POST /users/login - Login");
  console.log("GET /users - Get all users");
  console.log("GET /users/:id - Get user by ID");
  console.log("PUT /users/:id - Update user");
  console.log("PUT /users/:id/approve - Approve/reject artist");
  console.log("DELETE /users/:id - Delete user");
  console.log("POST /uploads - Upload image");
  console.log("GET /uploads - Get all uploads");
  console.log("PUT /uploads/:id/like - Update like");
  console.log("PUT /uploads/:id/download - Update download");
  console.log("GET /test - Test server");
});
