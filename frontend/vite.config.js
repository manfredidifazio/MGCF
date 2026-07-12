import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/auth": "http://localhost:5000",
      "/admin": "http://localhost:5000",
      "/security": "http://localhost:5000",
      "/accounts": "http://localhost:5000",
      "/accredits": "http://localhost:5000",
      "/account-statements": "http://localhost:5000",
      "/managed-items": "http://localhost:5000",
    },
  },
});