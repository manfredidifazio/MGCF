import {
  createAccredit,
  deleteAccredit,
  getAccredits,
  updateAccredit,
} from "../services/accreditService.js";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(body) {
  return {
    accountId: Number(body.accountId),
    causeId: Number(body.causeId),
    movementDate: cleanText(body.movementDate),
    amount: Number(body.amount),
    notes: cleanText(body.notes) || null,
  };
}

function validationMessage(accredit) {
  if (!Number.isInteger(accredit.accountId) || accreditingInvalid(accredit.accountId)) return "Seleziona un conto valido.";
  if (!Number.isInteger(accredit.causeId) || accreditingInvalid(accredit.causeId)) return "Seleziona una causale valida.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(accredit.movementDate)) return "Inserisci una data valida.";
  if (!Number.isFinite(accredit.amount) || accredit.amount <= 0) return "L'importo deve essere maggiore di zero.";
  return null;
}

function accreditingInvalid(value) {
  return value <= 0;
}

export async function listAccredits(req, res) {
  try {
    return res.json({ success: true, accredits: await getAccredits(req.user.id) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile caricare gli accrediti." });
  }
}

export async function addAccredit(req, res) {
  try {
    const accredit = normalize(req.body);
    const message = validationMessage(accredit);
    if (message) return res.status(400).json({ success: false, message });
    const created = await createAccredit(req.user.id, accredit);
    if (!created) return res.status(400).json({ success: false, message: "Conto o causale non disponibili." });
    return res.status(201).json({ success: true, accredit: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile registrare l'accredito." });
  }
}

export async function editAccredit(req, res) {
  try {
    const accredit = normalize(req.body);
    const message = validationMessage(accredit);
    if (message) return res.status(400).json({ success: false, message });
    const updated = await updateAccredit(req.user.id, Number(req.params.id), accredit);
    if (updated === undefined) return res.status(404).json({ success: false, message: "Accredito non trovato." });
    if (updated === null) return res.status(400).json({ success: false, message: "Conto o causale non disponibili." });
    return res.json({ success: true, accredit: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile modificare l'accredito." });
  }
}

export async function removeAccredit(req, res) {
  try {
    const deleted = await deleteAccredit(req.user.id, Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: "Accredito non trovato." });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile eliminare l'accredito." });
  }
}
