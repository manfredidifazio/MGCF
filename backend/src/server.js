import dotenv from "dotenv";
import app from "./app.js";
import pool from "./database/database.js";
import { ensureAccreditsStructure } from "./services/accreditService.js";
import { ensureAccountStatementsTable } from "./services/accountStatementService.js";
import { ensureManagedItemsTable } from "./services/managedItemService.js";
import { ensureUsersTable, initialAdminId } from "./services/userService.js";
import { ensureAccountsStructure } from "./services/accountService.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    await ensureUsersTable();
    const adminId = await initialAdminId();
    await ensureAccountsStructure(adminId);
    await ensureManagedItemsTable(adminId);
    await ensureAccreditsStructure(adminId);
    await ensureAccountStatementsTable(adminId);

    console.log("✅ PostgreSQL connesso");

    app.listen(PORT, () => {
      console.log(`🚀 Server avviato sulla porta ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Errore connessione database");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
