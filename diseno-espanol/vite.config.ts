import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@workspace/api-client-react": path.resolve(import.meta.dirname, "../api-client-react/src"),
      "@workspace/object-storage-web": path.resolve(import.meta.dirname, "../object-storage-web/src"),
      "@tanstack/react-query": path.resolve(import.meta.dirname, "node_modules/@tanstack/react-query"),
      "@uppy/core": path.resolve(import.meta.dirname, "node_modules/@uppy/core"),
      "@uppy/dashboard": path.resolve(import.meta.dirname, "node_modules/@uppy/dashboard"),
      "@uppy/react": path.resolve(import.meta.dirname, "node_modules/@uppy/react"),
      "@uppy/aws-s3": path.resolve(import.meta.dirname, "node_modules/@uppy/aws-s3"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
});
