const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const auth = require("../../middleware/auth");

const router = express.Router();

// PostgreSQL pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fsd",
  password: "Salian3210",
  port: 5432,
});

// @route    GET api/profile/me
// @desc     Get current user's profile
// @access   Private
router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  "/",
  auth,
  [
    check("status", "Status is required").notEmpty(),
    check("skills", "Skills is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      ...rest
    } = req.body;

    const profileFields = {
      user_id: req.user.id,
      website: website ? normalize(website, { forceHttps: true }) : "",
      skills: Array.isArray(skills) ? skills.join(",") : skills,
      ...rest,
    };

    const socialFields = { youtube, twitter, instagram, linkedin, facebook };
    for (const [key, value] of Object.entries(socialFields)) {
      if (value) socialFields[key] = normalize(value, { forceHttps: true });
    }

    try {
      // Check if profile exists
      const existingProfile = await pool.query(
        `SELECT * FROM profiles WHERE user_id = $1`,
        [req.user.id]
      );

      if (existingProfile.rows.length > 0) {
        // Update profile
        await pool.query(
          `UPDATE profiles SET website = $1, skills = $2, social = $3 WHERE user_id = $4`,
          [
            profileFields.website,
            profileFields.skills,
            socialFields,
            req.user.id,
          ]
        );
      } else {
        // Create profile
        await pool.query(
          `INSERT INTO profiles (user_id, website, skills, social) VALUES ($1, $2, $3, $4)`,
          [
            req.user.id,
            profileFields.website,
            profileFields.skills,
            socialFields,
          ]
        );
      }

      res.json({ msg: "Profile updated" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profiles");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete("/", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM posts WHERE user_id = $1", [req.user.id]);
    await pool.query("DELETE FROM profiles WHERE user_id = $1", [req.user.id]);
    await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get("/github/:username", async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );

    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });
    res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ msg: "No Github profile found" });
  }
});

module.exports = router;
