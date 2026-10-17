import { defineConfig } from "vite-plus"

export default defineConfig({
  fmt: { semi: false, ignorePatterns: ["docs/legacy/**"] },
  lint: {
    ignorePatterns: ["docs/legacy/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
})
