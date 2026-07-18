import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/payments/index.ts",
    "src/components/auth/index.ts",
    "src/components/tracking/index.ts",
    "src/components/subscription/index.ts",
    "src/components/documents/index.ts",
    "src/components/offline/index.ts",
    "src/components/suppliers/index.ts",
    "src/components/combobox/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "lucide-react"],
  treeshake: true,
  splitting: false,
});
