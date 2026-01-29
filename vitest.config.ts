import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["index.ts", "utils.ts"],
      exclude: ["**/*.test.ts", "vitest.config.ts"],
    },
  },
});
