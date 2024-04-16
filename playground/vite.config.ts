/// <reference types="vitest" />
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
// import staticAdapter from "@marko/run-adapter-static";
import figmaAdapter from "../src/index";
export default defineConfig({
  test: {
    includeSource: ['./src/**/*.ts'],
  },
  define: {
    'import.meta.root': `"${__dirname}/.."`
  },
  
  plugins: [
    marko({
      // adapter: staticAdapter(),
      adapter: figmaAdapter(),
    }),
  ],
});
