import cors from "cors";
import express from "express";

import accountRoutes from "./routes/accountRoutes.js";
import accreditRoutes from "./routes/accreditRoutes.js";
import accountStatementRoutes from "./routes/accountStatementRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import managedItemRoutes from "./routes/managedItemRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminUserRoutes);
app.use("/security", securityRoutes);
app.use("/accounts", accountRoutes);
app.use("/accredits", accreditRoutes);
app.use("/account-statements", accountStatementRoutes);
app.use("/managed-items", managedItemRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MGCF API attiva",
  });
});

export default app;
