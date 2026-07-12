import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgcf',
  password: process.env.DB_PASSWORD || 'G1ul1@018',
  port: process.env.DB_PORT || 5432,
});

try {
  // Get table structure
  const columnsResult = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='users' 
    ORDER BY ordinal_position
  `);
  console.log('\n📋 COLONNE TABELLA USERS:');
  columnsResult.rows.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
  
  // Get users
  const result = await pool.query('SELECT * FROM users LIMIT 5');
  console.log('\n👥 UTENTI NEL DATABASE:');
  console.table(result.rows);
  
  const countResult = await pool.query('SELECT COUNT(*) FROM users');
  console.log(`\n📊 Totale utenti: ${countResult.rows[0].count}`);
  
  await pool.end();
} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
