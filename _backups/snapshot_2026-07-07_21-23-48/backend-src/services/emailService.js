import nodemailer from "nodemailer";

function smtpReady() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_PASSWORD !== "app_password_gmail"
  );
}

function transporter() {
  if (!smtpReady()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: String(process.env.SMTP_SECURE ?? "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const client = transporter();

  if (!client || !from) {
    console.log(`[emailService] Email non inviata in locale. To: ${to} | Subject: ${subject}`);
    console.log(text ?? html);
    return { skipped: true };
  }

  try {
    await client.sendMail({ from, to, subject, html, text });
    return { skipped: false };
  } catch (error) {
    console.error("[emailService] Invio email non riuscito, link stampato in locale.");
    console.error(error.message);
    console.log(text ?? html);
    return { skipped: true, error: error.message };
  }
}

export async function sendVerificationEmail(user) {
  const baseUrl = process.env.APP_URL ?? "http://localhost:5173";
  const url = `${baseUrl}/verify-email?token=${encodeURIComponent(user.verificationToken)}`;
  return sendEmail({
    to: user.email,
    subject: "Conferma email MGCF",
    text: `Conferma il tuo account MGCF aprendo questo link: ${url}`,
    html: `<p>Conferma il tuo account MGCF:</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendPasswordResetEmail(user) {
  const baseUrl = process.env.APP_URL ?? "http://localhost:5173";
  const url = `${baseUrl}/reset-password?token=${encodeURIComponent(user.resetToken)}`;
  return sendEmail({
    to: user.email,
    subject: "Recupero password MGCF",
    text: `Reimposta la password MGCF aprendo questo link: ${url}`,
    html: `<p>Reimposta la password MGCF:</p><p><a href="${url}">${url}</a></p>`,
  });
}
