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
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
          .logo-container { padding: 30px 30px 20px 30px; text-align: center; background: #ffffff; }
          .logo-container img { max-width: 120px; height: auto; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; font-weight: 500; margin-bottom: 24px; color: #1f2937; }
          .message { font-size: 14px; line-height: 1.8; color: #4b5563; margin-bottom: 32px; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 15px; transition: all 0.3s; }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(180, 83, 9, 0.3); }
          .link-text { font-size: 12px; color: #6b7280; margin-top: 16px; word-break: break-all; }
          .link-text a { color: #b45309; text-decoration: none; }
          .footer { background: #f9fafb; padding: 24px 30px; text-align: center; font-size: 12px; color: #6b7280; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="https://mgcf.it/logo-v3.png" alt="MGCF Logo" />
          </div>
          <div class="content">
            <p class="greeting">Benvenuto/a! 👋</p>
            <p class="message">
              Ti ringraziamo per esserti registrato/a a MGCF. Per completare la registrazione e accedere al tuo account, 
              devi verificare il tuo indirizzo email cliccando il bottone qui sotto.
            </p>
            <div class="cta-container">
              <a href="${url}" class="cta-button">Verifica il tuo account</a>
            </div>
            <p class="message" style="font-size: 13px; color: #6b7280;">
              Se il bottone non funziona, copia e incolla il seguente link nel tuo browser:
            </p>
            <p class="link-text">
              <a href="${url}">${url}</a>
            </p>
            <p class="message" style="margin-top: 32px; font-size: 13px; color: #9ca3af;">
              <strong>Nota di sicurezza:</strong> Questo link scade dopo 24 ore. Se non hai richiesto questa registrazione, 
              puoi ignorare questa email in sicurezza.
            </p>
          </div>
          <div class="footer">
            <p><strong>MGCF - Modulo gestionale contabile fiscale</strong></p>
            <p>© 2026 Tutti i diritti riservati.</p>
            <p>Questa è una comunicazione automatica, non rispondere a questa email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({
    to: user.email,
    subject: "Verifica il tuo account MGCF",
    html,
    text: `Benvenuto/a!\n\nPer verificare il tuo account, apri questo link:\n${url}\n\nQuesto link scade dopo 24 ore.\n\nSe non hai richiesto questa registrazione, ignora questa email.`,
  });
}

export async function sendPasswordResetEmail(user) {
  const baseUrl = process.env.APP_URL ?? "http://localhost:5173";
  const url = `${baseUrl}/reset-password?token=${encodeURIComponent(user.resetToken)}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
          .logo-container { padding: 30px 30px 20px 30px; text-align: center; background: #ffffff; }
          .logo-container img { max-width: 120px; height: auto; }
          .content { padding: 40px 30px; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px; }
          .alert p { margin: 0; color: #92400e; font-size: 14px; font-weight: 500; }
          .greeting { font-size: 16px; font-weight: 500; margin-bottom: 24px; color: #1f2937; }
          .message { font-size: 14px; line-height: 1.8; color: #4b5563; margin-bottom: 32px; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 15px; transition: all 0.3s; }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(180, 83, 9, 0.3); }
          .link-text { font-size: 12px; color: #6b7280; margin-top: 16px; word-break: break-all; }
          .link-text a { color: #b45309; text-decoration: none; }
          .footer { background: #f9fafb; padding: 24px 30px; text-align: center; font-size: 12px; color: #6b7280; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="https://mgcf.it/logo-v3.png" alt="MGCF Logo" />
          </div>
          <div class="content">
            <div class="alert">
              <p>⚠️ Richiesta di reset password ricevuta</p>
            </div>
            <p class="greeting">Ciao,</p>
            <p class="message">
              Abbiamo ricevuto una richiesta di reset della password per il tuo account MGCF. 
              Se sei stato tu a fare questa richiesta, clicca il bottone qui sotto per impostare una nuova password.
            </p>
            <div class="cta-container">
              <a href="${url}" class="cta-button">Reimposta la password</a>
            </div>
            <p class="message" style="font-size: 13px; color: #6b7280;">
              Se il bottone non funziona, copia e incolla il seguente link nel tuo browser:
            </p>
            <p class="link-text">
              <a href="${url}">${url}</a>
            </p>
            <p class="message" style="margin-top: 32px; font-size: 13px; color: #9ca3af;">
              <strong>Informazioni importanti:</strong>
            </p>
            <ul style="font-size: 13px; color: #6b7280; margin: 12px 0; padding-left: 20px;">
              <li>Questo link scade dopo 1 ora</li>
              <li>Se non hai richiesto il reset della password, ignora questa email</li>
              <li>La tua password non cambierà fino a quando non completerai il processo</li>
            </ul>
          </div>
          <div class="footer">
            <p><strong>MGCF - Modulo gestionale contabile fiscale</strong></p>
            <p>© 2026 Tutti i diritti riservati.</p>
            <p>Questa è una comunicazione automatica, non rispondere a questa email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({
    to: user.email,
    subject: "Reimposta la password del tuo account MGCF",
    html,
    text: `Ciao,\n\nAbbiamo ricevuto una richiesta di reset della password. Per impostare una nuova password, apri questo link:\n${url}\n\nQuesto link scade dopo 1 ora.\n\nSe non hai richiesto il reset della password, ignora questa email e la tua password rimane al sicuro.\n\nSaluti,\nTeam MGCF`,
  });
}
