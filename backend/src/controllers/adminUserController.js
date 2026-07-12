import { adminDeleteUser, adminUpdateUser, listUsers } from "../services/userService.js";

function ensureAdmin(req, res) {
  if (req.user.role === "Administrator") return true;
  res.status(403).json({ success: false, message: "Accesso riservato agli amministratori." });
  return false;
}

export async function adminListUsers(req, res) {
  if (!ensureAdmin(req, res)) return;
  const users = await listUsers(typeof req.query.search === "string" ? req.query.search.trim() : "");
  return res.json({ success: true, users });
}

export async function adminEditUser(req, res) {
  if (!ensureAdmin(req, res)) return;
  const payload = {
    username: String(req.body.username ?? "").trim(),
    role: req.body.role === "Administrator" ? "Administrator" : "User",
    isActive: Boolean(req.body.isActive),
    isVerified: Boolean(req.body.isVerified),
  };
  if (!payload.username) return res.status(400).json({ success: false, message: "Nome obbligatorio." });
  const user = await adminUpdateUser(Number(req.params.id), payload);
  return res.status(user ? 200 : 404).json(user ? { success: true, user } : { success: false, message: "Utente non trovato." });
}

export async function adminRemoveUser(req, res) {
  if (!ensureAdmin(req, res)) return;
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ success: false, message: "Non puoi eliminare il tuo account da qui." });
  const result = await adminDeleteUser(Number(req.params.id));
  return res.status(result.success ? 200 : result.status ?? 400).json(result);
}
