// eslint-config-next 16 ships flat config directly — going through FlatCompat
// crashes on ESLint 9.39 with a circular-structure error in the eslintrc shim.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "src/generated/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
