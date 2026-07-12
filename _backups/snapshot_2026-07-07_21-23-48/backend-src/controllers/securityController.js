import {
  getSecurityStatus,
  updatePassword,
  updateSecurityAnswers,
} from "../services/securityService.js";

export async function getSecurity(req, res) {
  try {
    const result = await getSecurityStatus();
    return res.status(result.status ?? 200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Errore durante il recupero della configurazione.",
    });
  }
}

export async function saveSecurity(req, res) {
  try {
    const { middleSchoolAnswer, dogNameAnswer } = req.body;

    await updateSecurityAnswers(middleSchoolAnswer, dogNameAnswer);

    return res.json({
      success: true,
      message: "Domande di sicurezza aggiornate.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Errore durante il salvataggio.",
    });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Compila tutti i campi della parola d'ordine.",
      });
    }

    const result = await updatePassword(currentPassword, newPassword);
    return res.status(result.status ?? 200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento della parola d'ordine.",
    });
  }
}
