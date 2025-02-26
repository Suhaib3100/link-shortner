const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const validUrl = require('valid-url');
const { nanoid } = require('nanoid');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_FgsZ5NMHBu9W@ep-still-frog-a87tfdip-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
});

// Create URL table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0,
    last_accessed TIMESTAMP
  );
`).catch(err => console.error('Error creating table:', err));

// Create short URL
router.post('/shorten', async (req, res) => {
  try {
    const { url, customCode } = req.body;

    // Validate URL
    if (!validUrl.isUri(url)) {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Validate custom code if provided
    if (customCode) {
      if (customCode.length < 4 || customCode.length > 10) {
        return res.status(400).json({ error: 'Custom alias must be between 4 and 10 characters' });
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
        return res.status(400).json({ error: 'Custom alias can only contain letters, numbers, hyphens, and underscores' });
      }
    }

    let shortCode;
    if (customCode) {
      // Check if custom code is available
      const existing = await pool.query('SELECT * FROM urls WHERE short_code = $1', [customCode]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Custom code already in use' });
      }
      shortCode = customCode;
    } else {
      // Generate unique short code
      shortCode = nanoid(6);
    }

    // Insert URL into database
    const result = await pool.query(
      'INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *',
      [url, shortCode]
    );

    res.json({
      originalUrl: result.rows[0].original_url,
      shortCode: result.rows[0].short_code,
      shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/api/urls/${shortCode}`
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect to original URL
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get URL and update stats
    const result = await pool.query(
      'UPDATE urls SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP WHERE short_code = $1 RETURNING original_url',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.redirect(result.rows[0].original_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get URL stats
router.get('/stats/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      'SELECT original_url, short_code, clicks, created_at, last_accessed FROM urls WHERE short_code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;