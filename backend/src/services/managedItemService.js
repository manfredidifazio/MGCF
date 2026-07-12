import pool from "../database/database.js";

const fields = `
  id,
  user_id AS "userId",
  type,
  name,
  details,
  active,
  display_order AS "displayOrder",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function ensureManagedItemsTable(adminId) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS managed_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('tax', 'property', 'vehicle', 'cause')),
      name VARCHAR(160) NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE managed_items ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0
  `);

  await pool.query(`
    ALTER TABLE managed_items
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  `);
  if (adminId) {
    await pool.query("UPDATE managed_items SET user_id = $1 WHERE user_id IS NULL", [adminId]);
    await pool.query("ALTER TABLE managed_items ALTER COLUMN user_id SET NOT NULL");
  }

  await pool.query(`
    ALTER TABLE managed_items DROP CONSTRAINT IF EXISTS managed_items_type_check;
    ALTER TABLE managed_items
      ADD CONSTRAINT managed_items_type_check
      CHECK (type IN ('tax', 'property', 'vehicle', 'cause'))
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS managed_items_type_active_idx
    ON managed_items (user_id, type, active, name)
  `);
}

export async function getManagedItems(userId, type) {
  const result = await pool.query(
    `SELECT ${fields} FROM managed_items WHERE user_id = $1 AND type = $2 ORDER BY active DESC, display_order ASC, created_at DESC`,
    [userId, type]
  );
  return result.rows;
}

export async function createManagedItem(userId, item) {
  const maxOrderResult = await pool.query(
    `SELECT COALESCE(MAX(display_order), -1) AS max_order FROM managed_items WHERE user_id = $1 AND type = $2`,
    [userId, item.type]
  );
  const nextOrder = maxOrderResult.rows[0].max_order + 1;
  
  const result = await pool.query(
    `
      INSERT INTO managed_items (user_id, type, name, details, display_order)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      RETURNING ${fields}
    `,
    [userId, item.type, item.name, JSON.stringify(item.details), nextOrder]
  );
  return result.rows[0];
}

export async function updateManagedItem(userId, id, item) {
  const result = await pool.query(
    `
      UPDATE managed_items
      SET name = $1, details = $2::jsonb, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND type = $4 AND user_id = $5
      RETURNING ${fields}
    `,
    [item.name, JSON.stringify(item.details), id, item.type, userId]
  );
  return result.rows[0] ?? null;
}

export async function setManagedItemActive(userId, id, type, active) {
  const result = await pool.query(
    `
      UPDATE managed_items
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND type = $3 AND user_id = $4
      RETURNING ${fields}
    `,
    [active, id, type, userId]
  );
  return result.rows[0] ?? null;
}

export async function reorderManagedItems(userId, type, items) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    for (const item of items) {
      await client.query(
        `
          UPDATE managed_items
          SET display_order = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND type = $3 AND user_id = $4
        `,
        [item.displayOrder, item.id, type, userId]
      );
    }
    
    await client.query("COMMIT");
    
    const result = await pool.query(
      `SELECT ${fields} FROM managed_items WHERE user_id = $1 AND type = $2 ORDER BY active DESC, display_order ASC, created_at DESC`,
      [userId, type]
    );
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteManagedItem(userId, id, type) {
  const result = await pool.query(
    "DELETE FROM managed_items WHERE id = $1 AND type = $2 AND user_id = $3 RETURNING id",
    [id, type, userId]
  );
  return result.rows.length > 0;
}
