const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'flexjobs_db',
  max: 10, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000,
  // Disable SSL for local development
  ssl: false,
};

const pool = new Pool(dbConfig);


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


function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}


async function executeQuery(query, params = []) {
  try {
    
    const { query: convertedQuery, params: convertedParams } = convertQuery(query, params);
    const result = await pool.query(convertedQuery, convertedParams);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}


async function getOne(query, params = []) {
  console.log('🔄 DATABASE: Executing getOne query');
  console.log('🔄 DATABASE: Query:', query);
  console.log('🔄 DATABASE: Parameters:', params);
  
  try {
    const results = await executeQuery(query, params);
    console.log('✅ DATABASE: getOne completed, found:', results.length > 0 ? 'record' : 'no record');
    return results[0] || null;
  } catch (error) {
    console.error('❌ DATABASE getOne ERROR:', error.message);
    throw error;
  }
}


async function getMany(query, params = []) {
  return await executeQuery(query, params);
}


async function insertOne(table, data) {
  console.log('🔄 DATABASE: Starting insertOne operation');
  console.log('🔄 DATABASE: Table:', table);
  console.log('🔄 DATABASE: Data keys:', Object.keys(data));
  console.log('🔄 DATABASE: Data values (sanitized):', Object.keys(data).reduce((acc, key) => {
    acc[key] = key.includes('password') ? '[HIDDEN]' : data[key];
    return acc;
  }, {}));

  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(',');
    const query = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING id`;
    
    console.log('🔄 DATABASE: Generated query:', query);
    console.log('🔄 DATABASE: Query parameters count:', values.length);
    
    const result = await pool.query(query, values);
    console.log('✅ DATABASE: Insert successful, returned ID:', result.rows[0].id);
    
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ DATABASE INSERT ERROR:', {
      table,
      error: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      column: error.column,
      dataKeys: Object.keys(data)
    });
    throw error;
  }
}


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


async function deleteOne(table, whereClause, whereParams = []) {
  const whereClauseWithParams = whereClause.replace(/\?/g, (match, offset) => {
    const paramIndex = whereClause.substring(0, offset).split('?').length;
    return `$${paramIndex}`;
  });
  const query = `DELETE FROM ${table} WHERE ${whereClauseWithParams}`;
  const result = await pool.query(query, whereParams);
  return result.rowCount;
}


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
