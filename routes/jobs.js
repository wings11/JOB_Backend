const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a single job
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a job
router.post("/", async (req, res) => {
  const { title, company, type, line_id, salary_range, details } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "employer" && decoded.role !== "admin") {
      return res.status(403).json({ error: "Only employers or admins can post jobs" });
    }
    const result = await pool.query(
      "INSERT INTO jobs (title, company, type, line_id, salary_range, details, posted_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, company, type, line_id, salary_range, details, decoded.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(400).json({ error: err.message });
  }
});

// Update a job
router.put("/:id", async (req, res) => {
  const { title, company, type, line_id, salary_range, details } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const job = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (decoded.role !== "admin" && job.rows[0].posted_by !== decoded.id) {
      return res.status(403).json({ error: "Unauthorized to edit this job" });
    }
    const result = await pool.query(
      "UPDATE jobs SET title = $1, company = $2, type = $3, line_id = $4, salary_range = $5, details = $6 WHERE id = $7 RETURNING *",
      [title, company, type, line_id, salary_range, details, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a job
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const job = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (decoded.role !== "admin" && job.rows[0].posted_by !== decoded.id) {
      return res.status(403).json({ error: "Unauthorized to delete this job" });
    }
    await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;