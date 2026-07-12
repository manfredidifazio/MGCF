import pool from "../database/database.js";

const fields = `
  s.id,
  s.user_id AS "userId",
  s.account_id AS "accountId",
  s.period,
  s.previous_balance AS "previousBalance",
  s.current_balance AS "currentBalance",
  s.notes,
  s.created_at AS "createdAt",
  s.updated_at AS "updatedAt",
  a.name AS "accountName",
  a.bank,
  a.color AS "accountColor"
`;

export async function ensureAccountStatementsTable(adminId) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS account_statements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
      period DATE NOT NULL,
      previous_balance NUMERIC(14, 2) NOT NULL,
      current_balance NUMERIC(14, 2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (account_id, period)
    )
  `);
  await pool.query(`
    ALTER TABLE account_statements
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  `);
  await pool.query(`
    UPDATE account_statements s
    SET user_id = a.user_id
    FROM accounts a
    WHERE s.account_id = a.id AND s.user_id IS NULL
  `);
  if (adminId) {
    await pool.query("UPDATE account_statements SET user_id = $1 WHERE user_id IS NULL", [adminId]);
    await pool.query("ALTER TABLE account_statements ALTER COLUMN user_id SET NOT NULL");
  }
  await pool.query(`
    CREATE INDEX IF NOT EXISTS account_statements_period_idx ON account_statements (user_id, period DESC);
    CREATE INDEX IF NOT EXISTS account_statements_account_idx ON account_statements (user_id, account_id, period DESC)
  `);
}

export async function getAccountStatements(userId) {
  const result = await pool.query(`
    SELECT ${fields}
    FROM account_statements s
    JOIN accounts a ON a.id = s.account_id AND a.user_id = s.user_id
    WHERE s.user_id = $1
    ORDER BY s.period DESC, a.name ASC
  `, [userId]);
  return result.rows;
}

async function exactPrevious(client, userId, accountId, period, excludedId = null) {
  const result = await client.query(
    `
      SELECT current_balance AS "currentBalance"
      FROM account_statements
      WHERE user_id = $1
        AND account_id = $2
        AND period = ($3::date - INTERVAL '1 month')::date
        AND ($4::integer IS NULL OR id <> $4)
    `,
    [userId, accountId, period, excludedId]
  );
  return result.rows[0]?.currentBalance;
}

async function alignNext(client, userId, accountId, period, currentBalance) {
  await client.query(
    `
      UPDATE account_statements
      SET previous_balance = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND account_id = $3 AND period = ($4::date + INTERVAL '1 month')::date
    `,
    [currentBalance, userId, accountId, period]
  );
}

async function getById(client, userId, id) {
  const result = await client.query(
    `SELECT ${fields} FROM account_statements s JOIN accounts a ON a.id = s.account_id AND a.user_id = s.user_id WHERE s.user_id = $1 AND s.id = $2`,
    [userId, id]
  );
  return result.rows[0] ?? null;
}

export async function createAccountStatement(userId, statement) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const account = await client.query("SELECT id FROM accounts WHERE id = $1 AND user_id = $2 AND active = TRUE", [statement.accountId, userId]);
    if (account.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }
    const previous = await exactPrevious(client, userId, statement.accountId, statement.period);
    const previousBalance = previous ?? statement.previousBalance;
    const result = await client.query(
      `
        INSERT INTO account_statements (user_id, account_id, period, previous_balance, current_balance, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [userId, statement.accountId, statement.period, previousBalance, statement.currentBalance, statement.notes]
    );
    await alignNext(client, userId, statement.accountId, statement.period, statement.currentBalance);
    const created = await getById(client, userId, result.rows[0].id);
    await client.query("COMMIT");
    return created;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAccountStatement(userId, id, statement) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      `SELECT account_id AS "accountId", period, previous_balance AS "previousBalance" FROM account_statements WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }
    const current = existing.rows[0];
    const account = await client.query("SELECT id FROM accounts WHERE id = $1 AND user_id = $2", [statement.accountId, userId]);
    if (account.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const oldPrevious = await exactPrevious(client, userId, current.accountId, current.period, id);
    await alignNext(client, userId, current.accountId, current.period, oldPrevious ?? current.previousBalance);

    const newPrevious = await exactPrevious(client, userId, statement.accountId, statement.period, id);
    const previousBalance = newPrevious ?? statement.previousBalance;
    await client.query(
      `
        UPDATE account_statements
        SET account_id = $1,
            period = $2,
            previous_balance = $3,
            current_balance = $4,
            notes = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND user_id = $7
      `,
      [statement.accountId, statement.period, previousBalance, statement.currentBalance, statement.notes, id, userId]
    );
    await alignNext(client, userId, statement.accountId, statement.period, statement.currentBalance);
    const updated = await getById(client, userId, id);
    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteAccountStatement(userId, id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      `SELECT account_id AS "accountId", period, previous_balance AS "previousBalance" FROM account_statements WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }
    const statement = existing.rows[0];
    await client.query("DELETE FROM account_statements WHERE id = $1 AND user_id = $2", [id, userId]);
    const previous = await exactPrevious(client, userId, statement.accountId, statement.period);
    await alignNext(client, userId, statement.accountId, statement.period, previous ?? statement.previousBalance);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
