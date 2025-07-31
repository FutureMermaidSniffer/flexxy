const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'flexjobs_db',
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}

// Execute query helper function
async function executeQuery(query, params = []) {
  try {
    // Convert MySQL-style ? placeholders to PostgreSQL $1, $2, etc.
    const { query: convertedQuery, params: convertedParams } = convertQuery(query, params);
    const result = await pool.query(convertedQuery, convertedParams);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get single record helper
async function getOne(query, params = []) {
  const results = await executeQuery(query, params);
  return results[0] || null;
}

// Get multiple records helper
async function getMany(query, params = []) {
  return await executeQuery(query, params);
}

// Insert record helper
async function insertOne(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(',');
  const query = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING id`;
  
  const result = await pool.query(query, values);
  return result.rows[0].id;
}

// Update record helper
async function updateOne(table, data, whereClause, whereParams = []) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(',');
  const paramOffset = values.length;
  const whereClauseWithParams = whereClause.replace(/\?/g, (match, offset) => {
    const paramIndex = whereClause.substring(0, offset).split('?').length;
    return `$${paramOffset + paramIndex}`;
  });
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClauseWithParams}`;
  
  const result = await pool.query(query, [...values, ...whereParams]);
  return result.rowCount;
}

// Delete record helper
async function deleteOne(table, whereClause, whereParams = []) {
  const whereClauseWithParams = whereClause.replace(/\?/g, (match, offset) => {
    const paramIndex = whereClause.substring(0, offset).split('?').length;
    return `$${paramIndex}`;
  });
  const query = `DELETE FROM ${table} WHERE ${whereClauseWithParams}`;
  const result = await pool.query(query, whereParams);
  return result.rowCount;
}

// Initialize database connection
testConnection();

module.exports = {
  pool,
  executeQuery,
  getOne,
  getMany,
  insertOne,
  updateOne,
  deleteOne
};
