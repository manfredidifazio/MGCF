import bcrypt from "bcrypt";

import pool from "../database/database.js";

export async function getSecurityStatus() {
  const result = await pool.query(`
    SELECT
      middle_school_answer,
      dog_name_answer
    FROM settings
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return {
      success: false,
      status: 500,
      message: "Configurazione sicurezza non trovata.",
    };
  }

  const row = result.rows[0];

  return {
    success: true,
    middleSchoolConfigured: Boolean(row.middle_school_answer),
    dogConfigured: Boolean(row.dog_name_answer),
    middleSchoolAnswer: row.middle_school_answer ?? "",
    dogNameAnswer: row.dog_name_answer ?? "",
  };
}

export async function updateSecurityAnswers(
  middleSchoolAnswer,
  dogNameAnswer
) {
  await pool.query(
    `
      UPDATE settings
      SET
        middle_school_answer = $1,
        dog_name_answer = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `,
    [middleSchoolAnswer, dogNameAnswer]
  );

  return { success: true };
}

export async function updatePassword(currentPassword, newPassword) {
  const result = await pool.query(`
    SELECT password_hash
    FROM settings
    WHERE id = 1
  `);

  if (result.rows.length === 0) {
    return {
      success: false,
      status: 500,
      message: "Configurazione sicurezza non trovata.",
    };
  }

  const validPassword = await bcrypt.compare(
    currentPassword,
    result.rows[0].password_hash
  );

  if (!validPassword) {
    return {
      success: false,
      status: 401,
      message: "La parola d'ordine attuale non è corretta.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
      UPDATE settings
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `,
    [passwordHash]
  );

  return {
    success: true,
    message: "Parola d'ordine aggiornata correttamente.",
  };
}
