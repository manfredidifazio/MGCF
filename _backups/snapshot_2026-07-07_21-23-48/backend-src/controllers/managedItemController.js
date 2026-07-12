import {
  createManagedItem,
  deleteManagedItem,
  getManagedItems,
  setManagedItemActive,
  updateManagedItem,
} from "../services/managedItemService.js";

const allowedTypes = new Set(["tax", "property", "vehicle", "cause"]);
const cadences = new Set(["monthly", "quarterly", "semiannual", "annual", "one-time"]);

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value) {
  return cleanText(value) || null;
}

function normalizeItem(type, body) {
  const name = cleanText(body.name);

  if (type === "tax") {
    return {
      type,
      name,
      details: {
        cadence: cadences.has(body.cadence) ? body.cadence : "annual",
        nextDueDate: nullableText(body.nextDueDate),
        notes: nullableText(body.notes),
      },
    };
  }

  if (type === "property") {
    return {
      type,
      name,
      details: {
        address: cleanText(body.address),
        city: nullableText(body.city),
        postalCode: nullableText(body.postalCode),
        cadastralReference: nullableText(body.cadastralReference),
        notes: nullableText(body.notes),
      },
    };
  }

  if (type === "cause") {
    return {
      type,
      name,
      details: {
        description: nullableText(body.description),
      },
    };
  }

  const year = Number(body.year);
  return {
    type,
    name,
    details: {
      make: cleanText(body.make),
      model: cleanText(body.model),
      plate: cleanText(body.plate).replace(/\s+/g, "").toUpperCase(),
      year: Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null,
      notes: nullableText(body.notes),
    },
  };
}

function validationMessage(item) {
  if (!item.name) return "Il nome visualizzato è obbligatorio.";
  if (item.type === "property" && !item.details.address) return "L'indirizzo è obbligatorio.";
  if (item.type === "vehicle" && !item.details.make) return "La marca è obbligatoria.";
  if (item.type === "vehicle" && !item.details.model) return "Il modello è obbligatorio.";
  if (item.type === "vehicle" && !item.details.plate) return "La targa è obbligatoria.";
  return null;
}

function validType(req, res) {
  if (allowedTypes.has(req.params.type)) return true;
  res.status(404).json({ success: false, message: "Categoria non trovata." });
  return false;
}

export async function listManagedItems(req, res) {
  if (!validType(req, res)) return;
  try {
    const items = await getManagedItems(req.user.id, req.params.type);
    return res.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile caricare gli elementi." });
  }
}

export async function addManagedItem(req, res) {
  if (!validType(req, res)) return;
  try {
    const item = normalizeItem(req.params.type, req.body);
    const message = validationMessage(item);
    if (message) return res.status(400).json({ success: false, message });
    const created = await createManagedItem(req.user.id, item);
    return res.status(201).json({ success: true, item: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile creare l'elemento." });
  }
}

export async function editManagedItem(req, res) {
  if (!validType(req, res)) return;
  try {
    const item = normalizeItem(req.params.type, req.body);
    const message = validationMessage(item);
    if (message) return res.status(400).json({ success: false, message });
    const updated = await updateManagedItem(req.user.id, Number(req.params.id), item);
    if (!updated) return res.status(404).json({ success: false, message: "Elemento non trovato." });
    return res.json({ success: true, item: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile modificare l'elemento." });
  }
}

export async function changeManagedItemStatus(req, res) {
  if (!validType(req, res)) return;
  if (typeof req.body.active !== "boolean") {
    return res.status(400).json({ success: false, message: "Stato non valido." });
  }
  try {
    const updated = await setManagedItemActive(
      req.user.id,
      Number(req.params.id),
      req.params.type,
      req.body.active
    );
    if (!updated) return res.status(404).json({ success: false, message: "Elemento non trovato." });
    return res.json({ success: true, item: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile aggiornare lo stato." });
  }
}

export async function removeManagedItem(req, res) {
  if (!validType(req, res)) return;
  try {
    const deleted = await deleteManagedItem(req.user.id, Number(req.params.id), req.params.type);
    if (!deleted) return res.status(404).json({ success: false, message: "Elemento non trovato." });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Impossibile eliminare l'elemento." });
  }
}
