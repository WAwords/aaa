/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import WindiCSS from "vite-plugin-windicss";
import { resolve } from "path";
import { loadEnv } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let useMock = loadEnv(mode, process.cwd()).VITE_API_USE_MOCK === "true";
  return {
    server: {
      host: "0.0.0.0", // 开发服务器的地址
      port: 5555, // 开发服务器的端口号
      proxy: {
        "/api": {
          target: useMock
            ? "http://127.0.0.1:4523/m1/3866197-0-default"
            : loadEnv(mode, process.cwd()).VITE_API_BASE_URL_HOST, // 目标地址
          changeOrigin: true, // 是否换源
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [
      WindiCSS(),
      vue(),
      AutoImport({
        imports: ["vue", "vue-router"],
        resolvers: [ElementPlusResolver()],
        dts: "types/auto-imports.d.ts",
        dirs: [
          // 自动引入工具方法
          "src/utils",
        ],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: "types/components.d.ts",
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
    ],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src"),
        },
        {
          find: "#",
          replacement: resolve(__dirname, "./types"),
        },
      ],
    },
    test: {
      browser: {
        provider: 'playwright',
        enabled: true,
        name: "chromium", // 浏览器名称是必需的
        api: {
          port: 4444,
        },
      },
    },
  };
});
