const { Client } = require('pg');

const dbConfig = {
  host: 'localhost',
  port: 5435,
  database: 'sbts_db',
  user: 'sbts_user',
  password: 'LbePDtWSSkXOc5yN0ZlDw00zf'
};

async function check() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const res = await client.query(`
      SELECT "applicationId", "status", "paymentCompleted", "fullName" 
      FROM applications 
      JOIN users ON applications."UserId" = users.id
      LIMIT 20
    `);
    console.log('Applications in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
