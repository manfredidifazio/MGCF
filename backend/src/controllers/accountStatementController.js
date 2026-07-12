import {
  createAccountStatement,
  deleteAccountStatement,
  getAccountStatements,
  updateAccountStatement,
} from "../services/accountStatementService.js";

function normalize(body) {
  const [year, month] = String(body.period ?? "").split("-");
  return {
    accountId: Number(body.accountId),
    period: /^\d{4}-\d{2}$/.test(`${year}-${month}`) ? `${year}-${month}-01` : "",
    previousBalance: Number(body.previousBalance),
    currentBalance: Number(body.currentBalance),
    notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
  };
}

function validationMessage(statement) {
  if (!Number.isInteger(statement.accountId) || statement.accountId <= 0) return "Seleziona un conto valido.";
  if (!statement.period) return "Seleziona un mese valido.";
  if (!Number.isFinite(statement.previousBalance)) return "Inserisci il saldo del mese precedente.";
  if (!Number.isFinite(statement.currentBalance)) return "Inserisci il saldo del mese corrente.";
  return null;
}

export async function listAccountStatements(req, res) {
  try {
    return res.json({ success: true, statements: await getAccountStatements(req.user.id) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile caricare gli estratti conto." });
  }
}

export async function addAccountStatement(req, res) {
  try {
    const statement = normalize(req.body);
    const message = validationMessage(statement);
    if (message) return res.status(400).json({ success: false, message });
    const created = await createAccountStatement(req.user.id, statement);
    if (!created) return res.status(400).json({ success: false, message: "Conto non disponibile." });
    return res.status(201).json({ success: true, statement: created });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ success: false, message: "Esiste già un estratto per questo conto e mese." });
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile salvare l'estratto conto." });
  }
}

export async function editAccountStatement(req, res) {
  try {
    const statement = normalize(req.body);
    const message = validationMessage(statement);
    if (message) return res.status(400).json({ success: false, message });
    const updated = await updateAccountStatement(req.user.id, Number(req.params.id), statement);
    if (!updated) return res.status(404).json({ success: false, message: "Estratto conto non trovato." });
    return res.json({ success: true, statement: updated });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ success: false, message: "Esiste già un estratto per questo conto e mese." });
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile modificare l'estratto conto." });
  }
}

export async function removeAccountStatement(req, res) {
  try {
    const deleted = await deleteAccountStatement(req.user.id, Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: "Estratto conto non trovato." });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile eliminare l'estratto conto." });
  }
}
