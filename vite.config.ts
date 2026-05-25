import basicSsl from "@vitejs/plugin-basic-ssl"; // 추가
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()], // 추가
  server: { host: true },
});
