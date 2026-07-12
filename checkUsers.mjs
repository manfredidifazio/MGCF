import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

try {
  const result = await pool.query('SELECT id, email, nome, cognome FROM users LIMIT 10');
  console.log('👥 Utenti nel database:');
  console.table(result.rows);
  
  const countResult = await pool.query('SELECT COUNT(*) FROM users');
  console.log(`\nTotale utenti: ${countResult.rows[0].count}`);
  
  await pool.end();
} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
