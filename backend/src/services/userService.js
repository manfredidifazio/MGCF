import bcrypt from "bcrypt";
import crypto from "crypto";

import pool from "../database/database.js";
import { sendPasswordResetEmail } from "./emailService.js";

const userFields = `
  id,
  username,
  email,
  role,
  is_verified AS "isVerified",
  is_active AS "isActive",
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  last_login AS "lastLogin"
`;

function token() {
  return crypto.randomBytes(32).toString("hex");
}

export async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (role IN ('Administrator', 'User')),
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expiration TIMESTAMP,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )
  `);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const username = process.env.ADMIN_USERNAME || "Administrator";

  if (!email || !password) return null;

  const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  if (existing.rows.length) return existing.rows[0].id;

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users (username, email, password_hash, role, is_verified, is_active)
      VALUES ($1, LOWER($2), $3, 'Administrator', TRUE, TRUE)
      RETURNING id
    `,
    [username, email, passwordHash]
  );
  return result.rows[0].id;
}

export async function initialAdminId() {
  const configured = process.env.ADMIN_EMAIL;
  if (configured) {
    const result = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [configured]);
    if (result.rows[0]) return result.rows[0].id;
  }
  const result = await pool.query("SELECT id FROM users WHERE role = 'Administrator' ORDER BY id ASC LIMIT 1");
  return result.rows[0]?.id ?? null;
}

export async function createUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = token();
  const result = await pool.query(
    `
      INSERT INTO users (username, email, password_hash, is_verified, is_active, verification_token)
      VALUES ($1, LOWER($2), $3, FALSE, TRUE, $4)
      RETURNING ${userFields}, verification_token AS "verificationToken"
    `,
    [username, email, passwordHash, verificationToken]
  );
  return result.rows[0];
}

export async function verifyUserEmail(verificationToken) {
  const result = await pool.query(
    `
      UPDATE users
      SET is_verified = TRUE, verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE verification_token = $1
      RETURNING ${userFields}
    `,
    [verificationToken]
  );
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT ${userFields}, password_hash AS "passwordHash" FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await pool.query(`SELECT ${userFields} FROM users WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function touchLastLogin(id) {
  await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [id]);
}

export async function requestPasswordReset(email) {
  const resetToken = token();
  const expiration = new Date(Date.now() + 60 * 60 * 1000);
  const result = await pool.query(
    `
      UPDATE users
      SET reset_token = $1, reset_token_expiration = $2, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = LOWER($3) AND is_active = TRUE
      RETURNING ${userFields}, reset_token AS "resetToken"
    `,
    [resetToken, expiration, email]
  );
  if (result.rows[0]) await sendPasswordResetEmail(result.rows[0]);
}

export async function resetPassword(resetToken, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      UPDATE users
      SET password_hash = $1,
          reset_token = NULL,
          reset_token_expiration = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE reset_token = $2
        AND reset_token_expiration > CURRENT_TIMESTAMP
      RETURNING ${userFields}
    `,
    [passwordHash, resetToken]
  );
  return result.rows[0] ?? null;
}

export async function updateProfile(userId, { username }) {
  const result = await pool.query(
    `
      UPDATE users
      SET username = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING ${userFields}
    `,
    [username, userId]
  );
  return result.rows[0] ?? null;
}

export async function changeUserEmail(userId, email) {
  const result = await pool.query(
    `
      UPDATE users
      SET email = LOWER($1),
          is_verified = FALSE,
          verification_token = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING ${userFields}
    `,
    [email, userId]
  );
  return result.rows[0] ?? null;
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
  const currentHash = result.rows[0]?.password_hash;
  if (!currentHash || !(await bcrypt.compare(currentPassword, currentHash))) return false;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [passwordHash, userId]);
  return true;
}

export async function deleteOwnUser(userId) {
  const masterEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const user = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
  if (user.rows[0] && masterEmail && String(user.rows[0].email || "").toLowerCase() === masterEmail) {
    throw new Error("Il profilo Administrator master non può essere eliminato.");
  }
  await pool.query(
    `
      UPDATE users
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
    [userId]
  );
}

export async function listUsers(search = "") {
  const like = `%${search}%`;
  const masterEmail = process.env.ADMIN_EMAIL || "";
  const result = await pool.query(
    `
      SELECT
        ${userFields},
        (LOWER(COALESCE(email, '')) = LOWER($3)) AS "isMasterAdmin",
        (
          SELECT COUNT(*)::integer
          FROM accounts
          WHERE accounts.user_id = users.id
        ) AS "accountCount",
        (
          SELECT COUNT(*)::integer
          FROM accredits
          WHERE accredits.user_id = users.id
        ) AS "accreditCount",
        (
          SELECT COUNT(*)::integer
          FROM account_statements
          WHERE account_statements.user_id = users.id
        ) AS "statementCount",
        (
          SELECT COUNT(*)::integer
          FROM managed_items
          WHERE managed_items.user_id = users.id
        ) AS "itemCount",
        (
          (SELECT COUNT(*)::integer FROM accounts WHERE accounts.user_id = users.id) +
          (SELECT COUNT(*)::integer FROM accredits WHERE accredits.user_id = users.id) +
          (SELECT COUNT(*)::integer FROM account_statements WHERE account_statements.user_id = users.id) +
          (SELECT COUNT(*)::integer FROM managed_items WHERE managed_items.user_id = users.id)
        ) AS "totalDataCount"
      FROM users
      WHERE $1 = '' OR username ILIKE $2 OR email ILIKE $2
      ORDER BY (LOWER(COALESCE(email, '')) = LOWER($3)) DESC, created_at DESC
    `,
    [search, like, masterEmail]
  );
  return result.rows;
}

export async function adminUpdateUser(id, payload) {
  const masterEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const existing = await pool.query("SELECT email FROM users WHERE id = $1", [id]);
  const isMasterAdmin = masterEmail && String(existing.rows[0]?.email || "").toLowerCase() === masterEmail;
  const role = isMasterAdmin ? "Administrator" : payload.role;
  const isActive = isMasterAdmin ? true : payload.isActive;
  const isVerified = isMasterAdmin ? true : payload.isVerified;

  const result = await pool.query(
    `
      UPDATE users
      SET username = $1,
          role = $2,
          is_active = $3,
          is_verified = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING ${userFields}
    `,
    [payload.username, role, isActive, isVerified, id]
  );
  return result.rows[0] ?? null;
}

export async function adminDeleteUser(id) {
  const masterEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const existing = await pool.query("SELECT id, email FROM users WHERE id = $1", [id]);
  const user = existing.rows[0];
  if (!user) return { success: false, status: 404, message: "Utente non trovato." };
  if (masterEmail && String(user.email || "").toLowerCase() === masterEmail) {
    return { success: false, status: 400, message: "Il profilo Administrator master non può essere eliminato." };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM account_statements WHERE user_id = $1", [id]);
    await client.query("DELETE FROM accredits WHERE user_id = $1", [id]);
    await client.query("DELETE FROM managed_items WHERE user_id = $1", [id]);
    await client.query("DELETE FROM accounts WHERE user_id = $1", [id]);
    const deleted = await client.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    await client.query("COMMIT");
    return deleted.rows.length > 0
      ? { success: true }
      : { success: false, status: 404, message: "Utente non trovato." };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
