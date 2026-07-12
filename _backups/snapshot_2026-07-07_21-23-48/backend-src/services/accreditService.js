import pool from "../database/database.js";

const selectAccredits = `
  SELECT
    ac.id,
    ac.user_id AS "userId",
    ac.account_id AS "accountId",
    ac.cause_id AS "causeId",
    ac.movement_date::TEXT AS "movementDate",
    ac.description,
    ac.amount,
    ac.notes,
    ac.created_at AS "createdAt",
    ac.updated_at AS "updatedAt",
    a.name AS "accountName",
    a.color AS "accountColor",
    COALESCE(c.name, ac.description) AS "causeName"
  FROM accredits ac
  JOIN accounts a ON a.id = ac.account_id AND a.user_id = ac.user_id
  LEFT JOIN managed_items c ON c.id = ac.cause_id AND c.type = 'cause' AND c.user_id = ac.user_id
`;

export async function ensureAccreditsStructure(adminId) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accredits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
      cause_id INTEGER REFERENCES managed_items(id) ON DELETE SET NULL,
      movement_date DATE NOT NULL,
      description TEXT,
      amount NUMERIC(14, 2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE accredits
      ADD COLUMN IF NOT EXISTS cause_id INTEGER REFERENCES managed_items(id) ON DELETE SET NULL
  `);
  await pool.query(`
    ALTER TABLE accredits
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  `);
  await pool.query(`
    UPDATE accredits ac
    SET user_id = a.user_id
    FROM accounts a
    WHERE ac.account_id = a.id AND ac.user_id IS NULL
  `);
  if (adminId) {
    await pool.query("UPDATE accredits SET user_id = $1 WHERE user_id IS NULL", [adminId]);
    await pool.query("ALTER TABLE accredits ALTER COLUMN user_id SET NOT NULL");
  }
  await pool.query(`
    CREATE INDEX IF NOT EXISTS accredits_movement_date_idx ON accredits (user_id, movement_date DESC);
    CREATE INDEX IF NOT EXISTS accredits_account_id_idx ON accredits (user_id, account_id);
    CREATE INDEX IF NOT EXISTS accredits_cause_id_idx ON accredits (user_id, cause_id)
  `);
}

export async function getAccredits(userId) {
  const result = await pool.query(`${selectAccredits} WHERE ac.user_id = $1 ORDER BY ac.movement_date DESC, ac.id DESC`, [userId]);
  return result.rows;
}

async function validReferences(userId, accountId, causeId) {
  const result = await pool.query(
    `
      SELECT a.id AS "accountId", c.id AS "causeId", c.name AS "causeName"
      FROM accounts a
      CROSS JOIN managed_items c
      WHERE a.id = $1 AND a.user_id = $3 AND a.active = TRUE
        AND c.id = $2 AND c.user_id = $3 AND c.type = 'cause' AND c.active = TRUE
    `,
    [accountId, causeId, userId]
  );
  return result.rows[0] ?? null;
}

async function getAccredit(userId, id) {
  const result = await pool.query(`${selectAccredits} WHERE ac.user_id = $1 AND ac.id = $2`, [userId, id]);
  return result.rows[0] ?? null;
}

export async function createAccredit(userId, accredit) {
  const references = await validReferences(userId, accredit.accountId, accredit.causeId);
  if (!references) return null;
  const result = await pool.query(
    `
      INSERT INTO accredits (user_id, account_id, cause_id, movement_date, description, amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [userId, accredit.accountId, accredit.causeId, accredit.movementDate, references.causeName, accredit.amount, accredit.notes]
  );
  return getAccredit(userId, result.rows[0].id);
}

export async function updateAccredit(userId, id, accredit) {
  const references = await validReferences(userId, accredit.accountId, accredit.causeId);
  if (!references) return null;
  const result = await pool.query(
    `
      UPDATE accredits
      SET account_id = $1,
          cause_id = $2,
          movement_date = $3,
          description = $4,
          amount = $5,
          notes = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING id
    `,
    [accredit.accountId, accredit.causeId, accredit.movementDate, references.causeName, accredit.amount, accredit.notes, id, userId]
  );
  if (result.rows.length === 0) return undefined;
  return getAccredit(userId, id);
}

export async function deleteAccredit(userId, id) {
  const result = await pool.query("DELETE FROM accredits WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
  return result.rows.length > 0;
}
