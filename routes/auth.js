const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = express.Router();

// Configure Passport for Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth: Profile received", { id: profile.id, emails: profile.emails });
        if (!profile.emails || !profile.emails[0].value) {
          console.error("Google OAuth: No email provided in profile", profile);
          return done(new Error("No email provided by Google"));
        }
        const email = profile.emails[0].value;
        console.log("Google OAuth: Processing email", email);
        // Check if user exists
        let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
          console.log("Google OAuth: User found", user.rows[0].email);
          return done(null, user.rows[0]);
        }
        // Create new user with NULL password
        const role = email.endsWith("@rsu.ac.th") ? "student" : "guest";
        console.log("Google OAuth: Creating new user", { email, role });
        const result = await pool.query(
          "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *",
          [email, null, role]
        );
        console.log("Google OAuth: User created", result.rows[0].email);
        return done(null, result.rows[0]);
      } catch (err) {
        console.error("Google OAuth Error:", err.message, err.stack);
        return done(err);
      }
    }
  )
);

// Serialize/deserialize user for session
passport.serializeUser((user, done) => {
  console.log("Serializing user", user.id);
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      console.error("Deserialize: User not found", id);
      return done(new Error("User not found"));
    }
    console.log("Deserialized user", result.rows[0].email);
    done(null, result.rows[0]);
  } catch (err) {
    console.error("Deserialize Error:", err.message, err.stack);
    done(err);
  }
});

// Initialize Passport
router.use(passport.initialize());

// Client-side registration (student/guest only)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.error("Register: Missing email or password", req.body);
      return res.status(400).json({ error: "Email and password are required" });
    }
    const role = email.endsWith("@rsu.ac.th") ? "student" : "guest";
    console.log("Register: Creating user", { email, role });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role]
    );
    const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, process.env.JWT_SECRET);
    console.log("Register: User created", result.rows[0].email);
    res.json({ token, role: result.rows[0].role });
  } catch (err) {
    console.error("Register Error:", err.message, err.stack);
    if (err.code === "23505") {
      res.status(400).json({ error: "Email already registered" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Admin-only account creation (admin/employer)
router.post("/admin/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("Admin Register: No token provided");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      console.error("Admin Register: Non-admin attempted", decoded);
      return res.status(403).json({ error: "Only admins can create accounts" });
    }
    if (!["student", "employer", "admin", "guest"].includes(role)) {
      console.error("Admin Register: Invalid role", role);
      return res.status(400).json({ error: "Invalid role" });
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    console.log("Admin Register: Creating user", { email, role });
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNIN G id, email, role",
      [email, hashedPassword, role]
    );
    console.log("Admin Register: User created", result.rows[0].email);
    res.json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Admin Register Error:", err.message, err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Standard login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login: Attempting", { email });
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) {
      console.error("Login: User not found", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.password && !(await bcrypt.compare(password, user.password))) {
      console.error("Login: Invalid password", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.password && password) {
      console.error("Login: Google OAuth user attempted password login", email);
      return res.status(401).json({ error: "Use Google OAuth to log in" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    console.log("Login: Success", user.email);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login Error:", err.message, err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Google OAuth routes
router.get(
  "/google",
  (req, res, next) => {
    console.log("Initiating Google OAuth", { query: req.query });
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Google OAuth callback received", { query: req.query });
    next();
  },
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    console.log("Google OAuth: Generating token for user", req.user.email);
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Add token expiration for security
    );
    res.redirect(`https://rangsitjobs.netlify.app/auth/callback?token=${token}&role=${req.user.role}`);
  }
);

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("Get Me: No token provided");
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [decoded.id]);
    const user = result.rows[0];
    if (!user) {
      console.error("Get Me: User not found", decoded.id);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("Get Me: User retrieved", user.email);
    res.json(user);
  } catch (err) {
    console.error("Get Me Error:", err.message, err.stack);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;