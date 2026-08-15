#!/usr/bin/env node
/**
 * Translation maintenance (architecture §10).
 *
 *   node scripts/audit-locales.js         report missing / unused keys
 *   node scripts/audit-locales.js --fix   add missing keys, seeded from English
 *
 * "Unused" is a best-effort scan: keys reached only through a computed lookup
 * (`t(`categories.${x}`)`) are reported under a separate heading rather than
 * treated as dead, so nothing is deleted on a false positive.
 */
const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(__dirname, "..", "src", "assets", "locales");
const SOURCE_DIR = path.join(__dirname, "..", "src");
const BASE_LANGUAGE = "en";

const flatten = (object, prefix = "") =>
  Object.entries(object).reduce((keys, [key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return { ...keys, ...flatten(value, full) };
    }
    return { ...keys, [full]: value };
  }, {});

const setDeep = (object, dottedKey, value) => {
  const parts = dottedKey.split(".");
  let cursor = object;
  parts.slice(0, -1).forEach((part) => {
    if (typeof cursor[part] !== "object" || cursor[part] === null) cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = value;
};

const readLocale = (language) =>
  JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${language}.json`), "utf8"));

const collectSourceFiles = (dir, found = []) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "assets") collectSourceFiles(full, found);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      found.push(full);
    }
  });
  return found;
};

const languages = fs
  .readdirSync(LOCALES_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => path.basename(file, ".json"));

const locales = Object.fromEntries(
  languages.map((language) => [language, readLocale(language)]),
);
const flat = Object.fromEntries(
  languages.map((language) => [language, flatten(locales[language])]),
);

const source = collectSourceFiles(SOURCE_DIR)
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

// Any dotted string literal in the source counts as a reference: keys are also
// held in constants (`titleKey: "tabs.home"`) and read back via a variable.
const usedKeys = new Set(
  [...source.matchAll(/["'`]([A-Za-z0-9_]+(?:\.[A-Za-z0-9_-]+)+)["'`]/g)].map((m) => m[1]),
);

// Prefixes reached through interpolation, e.g. `categories.${name}`.
const dynamicPrefixes = [
  ...source.matchAll(/`([A-Za-z0-9_.]+)\.\$\{/g),
].map((m) => m[1]);

/**
 * i18next appends a CLDR plural suffix per language. English has two forms,
 * Arabic six — so `daysLeft_many` existing only in Arabic is correct, not a
 * drift. Compare on the stem instead.
 */
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
const stem = (key) => key.replace(PLURAL_SUFFIX, "");
const isPlural = (key) => PLURAL_SUFFIX.test(key);

const shouldFix = process.argv.includes("--fix");
let problems = 0;

const baseKeys = Object.keys(flat[BASE_LANGUAGE]);

languages
  .filter((language) => language !== BASE_LANGUAGE)
  .forEach((language) => {
    const targetStems = new Set(Object.keys(flat[language]).map(stem));
    const baseStems = new Set(baseKeys.map(stem));

    // A plural key is satisfied by any plural form of the same stem.
    const missing = baseKeys.filter((key) =>
      isPlural(key) ? !targetStems.has(stem(key)) : !(key in flat[language]),
    );
    const extra = Object.keys(flat[language]).filter((key) =>
      isPlural(key) ? !baseStems.has(stem(key)) : !(key in flat[BASE_LANGUAGE]),
    );

    if (missing.length) {
      problems += missing.length;
      console.log(`\n${language}: ${missing.length} key(s) missing vs ${BASE_LANGUAGE}`);
      missing.forEach((key) => console.log(`  - ${key}`));

      if (shouldFix) {
        missing.forEach((key) => setDeep(locales[language], key, flat[BASE_LANGUAGE][key]));
        fs.writeFileSync(
          path.join(LOCALES_DIR, `${language}.json`),
          `${JSON.stringify(locales[language], null, 2)}\n`,
        );
        console.log(`  -> seeded from ${BASE_LANGUAGE} (translate these)`);
      }
    }

    if (extra.length) {
      problems += extra.length;
      console.log(`\n${language}: ${extra.length} key(s) not present in ${BASE_LANGUAGE}`);
      extra.forEach((key) => console.log(`  - ${key}`));
    }
  });

const unused = baseKeys.filter(
  (key) =>
    !usedKeys.has(key) &&
    !usedKeys.has(stem(key)) &&
    !dynamicPrefixes.some((prefix) => key.startsWith(`${prefix}.`)),
);

if (unused.length) {
  console.log(`\n${BASE_LANGUAGE}: ${unused.length} key(s) with no literal call site`);
  console.log("(review before deleting — some may be reached dynamically)");
  unused.forEach((key) => console.log(`  - ${key}`));
}

if (!problems) console.log("\nAll languages are in sync.");
process.exit(problems && !shouldFix ? 1 : 0);
