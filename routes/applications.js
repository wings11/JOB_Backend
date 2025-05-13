const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/:id/apply", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "student") {
      return res.status(403).json({ error: "Only students can apply" });
    }
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    if (!user.rows[0].email.endsWith("@rsu.ac.th")) {
      return res.status(403).json({ error: "Only students with @rsu.ac.th emails can apply" });
    }
    const job = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    const existingApplication = await pool.query(
      "SELECT * FROM applications WHERE user_id = $1 AND job_id = $2",
      [decoded.id, req.params.id]
    );
    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: "You have already applied to this job" });
    }
    await pool.query(
      "INSERT INTO applications (user_id, job_id) VALUES ($1, $2) RETURNING *",
      [decoded.id, req.params.id]
    );
    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;