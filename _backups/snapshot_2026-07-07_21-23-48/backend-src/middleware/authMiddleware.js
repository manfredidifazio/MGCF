import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/auth.js";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Accesso non autorizzato.",
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Sessione scaduta. Effettua nuovamente l'accesso.",
    });
  }
}
