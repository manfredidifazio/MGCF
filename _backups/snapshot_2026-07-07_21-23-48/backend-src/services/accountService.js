import pool from "../database/database.js";

const accountFields = `
  id,
  user_id AS "userId",
  name,
  bank,
  iban,
  description,
  color,
  active,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function ensureAccountsStructure(adminId) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(160) NOT NULL,
      bank VARCHAR(160),
      iban VARCHAR(64),
      description TEXT,
      color VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  `);
  if (adminId) {
    await pool.query("UPDATE accounts SET user_id = $1 WHERE user_id IS NULL", [adminId]);
    await pool.query("ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL");
  }
  await pool.query("CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts (user_id, active, name)");
}

export async function getAccounts(userId) {
  const result = await pool.query(`
    SELECT ${accountFields}
    FROM accounts
    WHERE user_id = $1
    ORDER BY active DESC, name ASC
  `, [userId]);

  return result.rows;
}

async function accountNameExists(userId, name, excludedId = null) {
  const result = await pool.query(
    `
      SELECT 1
      FROM accounts
      WHERE user_id = $1
        AND LOWER(name) = LOWER($2)
        AND ($3::integer IS NULL OR id <> $3)
      LIMIT 1
    `,
    [userId, name, excludedId]
  );

  return result.rows.length > 0;
}

export async function createAccount(userId, account) {
  if (await accountNameExists(userId, account.name)) {
    return {
      success: false,
      status: 409,
      message: "Esiste già un conto con questo nome.",
    };
  }

  const result = await pool.query(
    `
      INSERT INTO accounts (user_id, name, bank, iban, description, color)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${accountFields}
    `,
    [userId, account.name, account.bank, account.iban, account.description, account.color]
  );

  return { success: true, account: result.rows[0] };
}

export async function updateAccount(userId, id, account) {
  if (await accountNameExists(userId, account.name, id)) {
    return {
      success: false,
      status: 409,
      message: "Esiste già un conto con questo nome.",
    };
  }

  const result = await pool.query(
    `
      UPDATE accounts
      SET name = $1,
          bank = $2,
          iban = $3,
          description = $4,
          color = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND user_id = $7
      RETURNING ${accountFields}
    `,
    [account.name, account.bank, account.iban, account.description, account.color, id, userId]
  );

  if (result.rows.length === 0) {
    return { success: false, status: 404, message: "Conto non trovato." };
  }

  return { success: true, account: result.rows[0] };
}

export async function setAccountActive(userId, id, active) {
  const result = await pool.query(
    `
      UPDATE accounts
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING ${accountFields}
    `,
    [active, id, userId]
  );

  if (result.rows.length === 0) {
    return { success: false, status: 404, message: "Conto non trovato." };
  }

  return { success: true, account: result.rows[0] };
}

export async function deleteAccount(userId, id) {
  const result = await pool.query(
    `
      DELETE FROM accounts
      WHERE id = $1 AND user_id = $2
        AND NOT EXISTS (
          SELECT 1 FROM accredits WHERE account_id = $1 AND user_id = $2
        )
      RETURNING id
    `,
    [id, userId]
  );

  if (result.rows.length > 0) {
    return { success: true };
  }

  const existing = await pool.query(
    "SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2 LIMIT 1",
    [id, userId]
  );

  if (existing.rows.length === 0) {
    return { success: false, status: 404, message: "Conto non trovato." };
  }

  return {
    success: false,
    status: 409,
    message: "Il conto contiene movimenti e non può essere eliminato. Puoi archiviarlo.",
  };
}
