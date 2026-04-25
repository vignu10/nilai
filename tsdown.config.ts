import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/server.ts", "src/cli.ts", "src/hook.ts"],
  format: "esm",
  dts: true,
});
