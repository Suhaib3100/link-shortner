const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Database configuration
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_FgsZ5NMHBu9W@ep-still-frog-a87tfdip-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
});

// Test database connection
pool.connect((err, client, done) => {
  if (err) {
    logger.error('Error connecting to the database', err);
  } else {
    logger.info('Successfully connected to database');
    done();
  }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Simple route to show server status
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Routes will be imported here
app.use('/api/urls', require('./routes/urls'));
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;