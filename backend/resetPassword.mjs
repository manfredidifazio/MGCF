import bcrypt from 'bcrypt';
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

const password = 'CambiaQuestaPassword123!';
const email = 'manfredi.difazio@gmail.com';

try {
  // Create new hash
  const newHash = await bcrypt.hash(password, 10);
  console.log(`\n🔄 Aggiornamento password per: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Nuovo hash: ${newHash}`);
  
  // Update in database
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, username',
    [newHash, email]
  );
  
  if (result.rows.length === 0) {
    console.log('❌ Utente non trovato!');
  } else {
    const user = result.rows[0];
    console.log(`\n✅ Password aggiornata`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log('\n✨ Puoi ora accedere con: CambiaQuestaPassword123!');
  }
  
  await pool.end();
} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
