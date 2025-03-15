const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const { Pool } = require("pg");

// PostgreSQL configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fsd",
  password: "Salian3210",
  port: 5432,
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  "/",
  check("name", "Name is required").notEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if the user already exists
      const userCheckQuery = "SELECT * FROM users WHERE email = $1";
      const userCheckResult = await pool.query(userCheckQuery, [email]);

      if (userCheckResult.rows.length > 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // Generate avatar URL
      const avatar = normalize(
        gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm",
        }),
        { forceHttps: true }
      );

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into the database
      const insertUserQuery =
        "INSERT INTO users (name, email, avatar, password) VALUES ($1, $2, $3, $4) RETURNING id";
      const insertUserResult = await pool.query(insertUserQuery, [
        name,
        email,
        avatar,
        hashedPassword,
      ]);

      const userId = insertUserResult.rows[0].id;

      // Create JWT payload
      const payload = {
        user: {
          id: userId,
        },
      };

      // Sign the token
      jwt.sign(payload, "jwtSecret", { expiresIn: "5 days" }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
