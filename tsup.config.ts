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
    "src/components/data-table/index.ts",
    "src/components/pin-login/index.ts",
    "src/components/app-switcher/index.ts",
    "src/components/navigation/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "lucide-react"],
  treeshake: true,
  splitting: false,
});
