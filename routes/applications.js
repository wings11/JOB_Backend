const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Apply for a job
router.post("/:id/apply", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    if (decoded.role !== "student") {
      return res.status(403).json({ error: "Only students can apply" });
    }
    const user = await pool.query("SELECT id, email FROM users WHERE id = $1", [decoded.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.rows[0].email.endsWith("@rsu.ac.th")) {
      return res.status(403).json({ error: "Only students with @rsu.ac.th emails can apply" });
    }
    const job = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    const existingApplication = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND job_id = $2",
      [decoded.id, req.params.id]
    );
    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: "You have already applied to this job" });
    }
    const result = await pool.query(
      "INSERT INTO applications (student_id, job_id, name, email, resume) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [decoded.id, req.params.id, null, user.rows[0].email, null]
    );
    res.json({ message: "Application submitted successfully", application: result.rows[0] });
  } catch (err) {
    console.error("Error applying for job:", err.message, err.stack);
    res.status(400).json({ error: err.message || "Failed to apply for job" });
  }
});

// Get all applications for the authenticated student
router.get("/student", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    if (decoded.role !== "student") {
      return res.status(403).json({ error: "Only students can access this endpoint" });
    }
    const result = await pool.query(
      `SELECT a.id, a.job_id, a.student_id, a.email, a.resume, a.applied_at, 
              j.title, j.company
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.student_id = $1`,
      [decoded.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching applications:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

module.exports = router;