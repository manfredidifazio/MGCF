import { login as loginService } from "../services/authService.js";
import {
  changeUserEmail,
  changeUserPassword,
  createUser,
  deleteOwnUser,
  findUserById,
  resetPassword,
  updateProfile,
  verifyUserEmail,
} from "../services/userService.js";
import { sendVerificationEmail } from "../services/emailService.js";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req, res) {
  try {
    const email = clean(req.body.email).toLowerCase();
    const password = clean(req.body.password);
    const confirmPassword = clean(req.body.confirmPassword);

    if (!validEmail(email) || password.length < 8 || password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Email non valida o password troppo corta (min 8 caratteri)." });
    }

    // Generate username from email (before @)
    const username = email.split("@")[0];

    const user = await createUser({ username, email, password });
    
    // Send verification email
    await sendVerificationEmail(user);

    return res.status(201).json({ success: true, message: "Registrazione completata! Controlla la tua email per verificare l'account." });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ success: false, message: "Email già registrata." });
    console.error(error);
    return res.status(500).json({ success: false, message: "Errore durante la registrazione." });
  }
}

export async function verifyEmail(req, res) {
  try {
    const user = await verifyUserEmail(clean(req.query.token || req.body.token));
    if (!user) return res.status(400).json({ success: false, message: "Token di verifica non valido." });
    return res.json({ success: true, user, message: "Email verificata correttamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Errore durante la verifica email." });
  }
}

export async function login(req, res) {
  try {
    const result = await loginService(clean(req.body.email), clean(req.body.password));
    return res.status(result.status ?? 200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Errore durante il login." });
  }
}

export async function me(req, res) {
  const user = await findUserById(req.user.id);
  return res.status(user ? 200 : 404).json(user ? { success: true, user } : { success: false, message: "Utente non trovato." });
}

export async function forgotPassword(req, res) {
  return res.json({ success: false, message: "Recupero password via email disattivato. Contatta l'amministratore." });
}

export async function resetUserPassword(req, res) {
  const password = clean(req.body.password);
  if (password.length < 8 || password !== clean(req.body.confirmPassword)) {
    return res.status(400).json({ success: false, message: "Password non valida o non confermata." });
  }
  const user = await resetPassword(clean(req.body.token), password);
  return res.status(user ? 200 : 400).json(user ? { success: true, user } : { success: false, message: "Token di recupero non valido o scaduto." });
}

export async function editProfile(req, res) {
  const username = clean(req.body.username);
  if (!username) return res.status(400).json({ success: false, message: "Nome utente obbligatorio." });
  const user = await updateProfile(req.user.id, { username });
  return res.json({ success: true, user });
}

export async function editEmail(req, res) {
  const email = clean(req.body.email).toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ success: false, message: "Email non valida." });
  try {
    const user = await changeUserEmail(req.user.id, email);
    return res.json({ success: true, user, message: "Email aggiornata. L'account dovrà essere riconfermato dall'amministratore." });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ success: false, message: "Email già registrata." });
    throw error;
  }
}

export async function editPassword(req, res) {
  const ok = await changeUserPassword(req.user.id, clean(req.body.currentPassword), clean(req.body.newPassword));
  return res.status(ok ? 200 : 400).json(ok ? { success: true } : { success: false, message: "Password attuale non corretta." });
}

export async function removeOwnAccount(req, res) {
  await deleteOwnUser(req.user.id);
  return res.json({ success: true });
}
