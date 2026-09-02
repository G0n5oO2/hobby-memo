import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1", // ← 追加: Windowsのlocalhost名前解決(IPv6優先)によるハングを回避
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000/", // ← localhost → 127.0.0.1 に変更(末尾スラッシュも削除)
        changeOrigin: true, // ← 追加: プロキシ先へのOriginヘッダー偽装。CORSエラー防止の標準装備
      },
    },
  },
});