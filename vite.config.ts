import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build:
    command === "build"
      ? {
          lib: {
            entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
            name: "VueWangEditorPlus",
            fileName: "vue-wangeditor-plus",
            cssFileName: "style",
          },
          rollupOptions: {
            external: [
              "vue",
              "@wangeditor/editor",
              "@wangeditor/editor-for-vue",
            ],
            output: {
              exports: "named",
              globals: {
                vue: "Vue",
                "@wangeditor/editor": "WangEditor",
                "@wangeditor/editor-for-vue": "WangEditorForVue",
              },
            },
          },
        }
      : undefined,
}));
