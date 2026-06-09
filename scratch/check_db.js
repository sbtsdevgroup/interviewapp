const { Client } = require('pg');

const dbConfig = {
  host: 'localhost',
  port: 15456,
  database: 'icbm_db',
  user: 'icbm_user',
  password: 'icbm_password'
};

async function check() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const res = await client.query(`
      SELECT u.id, u.email, u.password, u."fullName"
      FROM users u 
      JOIN applications a ON a."UserId" = u.id
      WHERE a."applicationId" = 'APP-2025-67987'
    `);
    console.log('User Details:');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
