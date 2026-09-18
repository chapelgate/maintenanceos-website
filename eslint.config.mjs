import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "next-env.d.ts",
      ".next/**",
      "out/**",
      ".data/**",
      "node_modules/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Static export site uses plain anchors with trailingSlash; Link optional.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
