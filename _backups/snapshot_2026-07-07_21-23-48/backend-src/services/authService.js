import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/auth.js";
import { findUserByEmail, touchLastLogin } from "./userService.js";

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };
}

export async function login(email, password) {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { success: false, status: 401, message: "Email o password non corretti." };
  }

  if (!user.isActive) {
    return { success: false, status: 403, message: "Account bloccato. Contatta l'amministratore." };
  }

  if (!user.isVerified) {
    return { success: false, status: 403, message: "Account in attesa di conferma amministratore." };
  }

  await touchLastLogin(user.id);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  return { success: true, token, user: publicUser(user) };
}
