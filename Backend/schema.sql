-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,                -- Unique identifier for the user
  name VARCHAR(255) NOT NULL,           -- User's name
  email VARCHAR(255) UNIQUE NOT NULL,   -- User's email (must be unique)
  password TEXT NOT NULL,               -- User's hashed password
  avatar TEXT,                          -- URL to the user's avatar
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for when the user is created
);

-- Profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,                -- Unique identifier for the profile
  user_id INT REFERENCES users(id),     -- Foreign key referencing the users table
  website TEXT,                         -- User's website
  skills TEXT,                          -- Comma-separated list of skills
  social JSONB,                         -- Social media links as a JSON object
  status VARCHAR(255)                   -- Status or job title
);

-- Posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,                -- Unique identifier for the post
  user_id INT NOT NULL REFERENCES users(id), -- Foreign key referencing the users table
  text TEXT NOT NULL,                   -- Content of the post
  name VARCHAR(255),                    -- Name of the post author
  avatar TEXT,                          -- Avatar of the post author
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for when the post is created
);

-- Likes table
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,                -- Unique identifier for the like
  post_id INT NOT NULL REFERENCES posts(id), -- Foreign key referencing the posts table
  user_id INT NOT NULL                  -- Foreign key referencing the users table
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,                -- Unique identifier for the comment
  post_id INT NOT NULL REFERENCES posts(id), -- Foreign key referencing the posts table
  user_id INT NOT NULL,                 -- Foreign key referencing the users table
  text TEXT NOT NULL,                   -- Content of the comment
  name VARCHAR(255),                    -- Name of the comment author
  avatar TEXT,                          -- Avatar of the comment author
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for when the comment is created
);
