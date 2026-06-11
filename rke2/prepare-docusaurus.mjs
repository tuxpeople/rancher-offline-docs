import { readFile, writeFile } from "node:fs/promises";

const configFile = process.argv[2] || "docusaurus.config.js";
let config = await readFile(configFile, "utf8");

if (!config.includes("experimental_router")) {
  const baseUrlPattern = /^(\s*baseUrl:\s*['"][^'"]+['"],)$/m;
  if (!baseUrlPattern.test(config)) {
    throw new Error("Unable to find baseUrl in docusaurus.config.js");
  }
  config = config.replace(
    baseUrlPattern,
    "$1\n  future: { experimental_router: 'hash' },",
  );
}

const searchNavbarPattern =
  /\n\s*\{\s*type:\s*['"]search['"],\s*position:\s*['"]right['"],\s*\},/;
config = config.replace(searchNavbarPattern, "");

const searchThemePattern =
  /  themes:\s*\[\s*['"]@docusaurus\/theme-mermaid['"],[\s\S]*?\n  \],\n  plugins:/;
if (searchThemePattern.test(config)) {
  config = config.replace(
    searchThemePattern,
    "  themes: ['@docusaurus/theme-mermaid'],\n  plugins:",
  );
} else if (!config.includes("themes: ['@docusaurus/theme-mermaid']")) {
  throw new Error("Unable to find the RKE2 local search theme configuration");
}

await writeFile(configFile, config);
