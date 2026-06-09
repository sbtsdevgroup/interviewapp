const { Client } = require('pg');

const dbConfig = {
  host: 'localhost',
  port: 15456,
  database: 'icbm_db',
  user: 'icbm_user',
  password: 'icbm_password'
};

async function restore() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    
    const originalHash = '$2b$12$1i6fcLAREDgQGED1HdzCw.3vlZ4Eh99MA6UDtYz1pfHClwJMUfqdG';
    await client.query(`
      UPDATE users 
      SET password = $1 
      WHERE id = (
        SELECT "UserId" 
        FROM applications 
        WHERE "applicationId" = 'APP-2025-67987'
      )
    `, [originalHash]);
    
    console.log('Password successfully restored to original hash');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

restore();
