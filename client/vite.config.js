import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // -------------------------------
  // LOCAL DEVELOPMENT PROXY (FIXED)
  // -------------------------------
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://movie-bjil.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
