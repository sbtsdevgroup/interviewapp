const { Client } = require('pg');

const dbConfig = {
  host: 'localhost',
  port: 15456,
  database: 'icbm_db',
  user: 'icbm_user',
  password: 'icbm_password'
};

async function change() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    
    // Get current hash
    const currentRes = await client.query(`
      SELECT u.password, u.email
      FROM users u 
      JOIN applications a ON a."UserId" = u.id
      WHERE a."applicationId" = 'APP-2025-67987'
    `);
    const originalHash = currentRes.rows[0].password;
    console.log(`ORIGINAL_HASH=${originalHash}`);
    
    // Update to new hash
    const newHash = '$2a$10$4B1RkuRtmrxyREdrlQFUheQt7XgQkhxn9Jzc5RWpaRjA.ohqO6b5C'; // password123
    await client.query(`
      UPDATE users 
      SET password = $1 
      WHERE id = (
        SELECT "UserId" 
        FROM applications 
        WHERE "applicationId" = 'APP-2025-67987'
      )
    `, [newHash]);
    
    console.log('Password updated successfully to password123');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

change();
