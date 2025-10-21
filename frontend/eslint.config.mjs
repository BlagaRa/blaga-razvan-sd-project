import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    rules: {
      // 🚀 dezactivează regula doar aici
      "@typescript-eslint/no-explicit-any": "off",
    },

    // 🔥 (opțional, doar dacă vrei să limitezi dezactivarea la anumite foldere)
    files: ["src/store/**/*.ts", "store/**/*.ts"],
  },
];

export default eslintConfig;
