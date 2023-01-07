import react from "@vitejs/plugin-react";
import { checker } from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default {
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      overlay: {
        initialIsOpen: false,
        position: "br",
      },
      typescript: true,
    }),
  ],
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
};
