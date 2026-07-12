import {
  createAccount,
  deleteAccount,
  getAccounts,
  setAccountActive,
  updateAccount,
} from "../services/accountService.js";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAccount(body) {
  const color = cleanText(body.color);

  return {
    name: cleanText(body.name),
    bank: cleanText(body.bank) || null,
    iban: cleanText(body.iban).replace(/\s+/g, "").toUpperCase() || null,
    description: cleanText(body.description) || null,
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : "#f59e0b",
  };
}

export async function listAccounts(req, res) {
  try {
    const accounts = await getAccounts(req.user.id);
    return res.json({ success: true, accounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Errore durante il caricamento dei conti.",
    });
  }
}

export async function addAccount(req, res) {
  try {
    const account = normalizeAccount(req.body);

    if (!account.name) {
      return res.status(400).json({
        success: false,
        message: "Il nome del conto è obbligatorio.",
      });
    }

    const result = await createAccount(req.user.id, account);
    return res.status(result.status ?? 201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Errore durante la creazione del conto.",
    });
  }
}

export async function editAccount(req, res) {
  try {
    const account = normalizeAccount(req.body);

    if (!account.name) {
      return res.status(400).json({
        success: false,
        message: "Il nome del conto è obbligatorio.",
      });
    }

    const result = await updateAccount(req.user.id, Number(req.params.id), account);
    return res.status(result.status ?? 200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Errore durante la modifica del conto.",
    });
  }
}

export async function changeAccountStatus(req, res) {
  try {
    if (typeof req.body.active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Stato del conto non valido.",
      });
    }

    const result = await setAccountActive(
      req.user.id,
      Number(req.params.id),
      req.body.active
    );

    return res.status(result.status ?? 200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento del conto.",
    });
  }
}

export async function removeAccount(req, res) {
  try {
    const result = await deleteAccount(req.user.id, Number(req.params.id));
    return res.status(result.status ?? 200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione del conto.",
    });
  }
}
