import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const basePath = process.env.BASE_PATH;

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "serve" ? "/" : basePath || "/",
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
}));
