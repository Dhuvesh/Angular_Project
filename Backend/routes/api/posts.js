const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

// PostgreSQL pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fsd",
  password: "Salian3210",
  port: 5432,
});

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  "/",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;

    try {
      const userResult = await pool.query(
        "SELECT name, avatar FROM users WHERE id = $1",
        [req.user.id]
      );
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const newPost = await pool.query(
        `INSERT INTO posts (text, name, avatar, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [text, user.name, user.avatar, req.user.id]
      );

      res.json(newPost.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    res.json(posts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);

    if (post.rows.length === 0) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const post = postResult.rows[0];

    // Check user
    if (post.user_id !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const likeCheck = await pool.query(
      `SELECT * FROM likes WHERE post_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (likeCheck.rows.length > 0) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    await pool.query(`INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`, [
      req.params.id,
      req.user.id,
    ]);

    const likes = await pool.query(`SELECT * FROM likes WHERE post_id = $1`, [
      req.params.id,
    ]);
    res.json(likes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const likeCheck = await pool.query(
      `SELECT * FROM likes WHERE post_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (likeCheck.rows.length === 0) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    await pool.query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2`, [
      req.params.id,
      req.user.id,
    ]);

    const likes = await pool.query(`SELECT * FROM likes WHERE post_id = $1`, [
      req.params.id,
    ]);
    res.json(likes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;

    try {
      const userResult = await pool.query(
        "SELECT name, avatar FROM users WHERE id = $1",
        [req.user.id]
      );
      const user = userResult.rows[0];

      const comment = await pool.query(
        `INSERT INTO comments (post_id, user_id, text, name, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.params.id, req.user.id, text, user.name, user.avatar]
      );

      res.json(comment.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const commentResult = await pool.query(
      `SELECT * FROM comments WHERE id = $1 AND post_id = $2`,
      [req.params.comment_id, req.params.id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    const comment = commentResult.rows[0];

    if (comment.user_id !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await pool.query(`DELETE FROM comments WHERE id = $1`, [
      req.params.comment_id,
    ]);

    res.json({ msg: "Comment removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
