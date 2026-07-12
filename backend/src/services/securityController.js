import {
  getSecurityStatus,
  updateSecurityAnswers,
} from "../services/securityService.js";

/*
=========================================
GET SICUREZZA
=========================================
*/

export async function getSecurity(req, res) {
  try {
    const result = await getSecurityStatus();

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Errore durante il recupero della configurazione.",
    });
  }
}

/*
=========================================
SALVA DOMANDE
=========================================
*/

export async function saveSecurity(req, res) {
  try {
    const {
      middleSchoolAnswer,
      dogNameAnswer,
    } = req.body;

    await updateSecurityAnswers(
      middleSchoolAnswer,
      dogNameAnswer
    );

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