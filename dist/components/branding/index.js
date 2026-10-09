// src/components/branding/service-name.ts
var SHORT_NAME_MAX = 12;
var LEADING_WORDS = /* @__PURE__ */ new Set([
  // English articles and demonstratives
  "the",
  "a",
  "an",
  "this",
  "that",
  "these",
  "those",
  // Swahili has no articles; these are its demonstratives (this/that/those) across noun classes
  "huyu",
  "huyo",
  "yule",
  "hawa",
  "hao",
  "wale",
  "hii",
  "hiyo",
  "ile",
  "hizi",
  "hizo",
  "zile",
  "huu",
  "huo",
  "ule",
  "hiki",
  "hicho",
  "kile",
  "hivi",
  "hivyo",
  "hili",
  "hilo",
  "lile",
  "hayo",
  "yale",
  // French, Spanish, Italian, Portuguese
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "el",
  "los",
  "las",
  "una",
  "unos",
  "unas",
  "il",
  "lo",
  "gli",
  "uno",
  "o",
  "os",
  "as",
  "um",
  "uma",
  // German, Dutch
  "der",
  "die",
  "das",
  "ein",
  "eine",
  "de",
  "het",
  "een",
  // Arabic definite article as written in Latin script
  "al"
]);
var clean = (s) => typeof s === "string" ? s.trim() : "";
function serviceBrandingMap(metadata) {
  const all = metadata?.service_branding;
  return all && typeof all === "object" ? all : void 0;
}
function serviceBrandingEntry(metadata, service) {
  const entry = serviceBrandingMap(metadata)?.[service];
  return entry && typeof entry === "object" ? entry : null;
}
function tenantBrandWord(tenantName) {
  const words = clean(tenantName).split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length > 1 && LEADING_WORDS.has(words[0].toLowerCase())) {
    return `${words[0]} ${words[1]}`;
  }
  return words[0];
}
function serviceAppName(tenantName, service, fallback, custom) {
  const own = clean(custom?.name);
  if (own) return own;
  const word = tenantBrandWord(tenantName) || clean(fallback);
  return word ? `${word} ${service}` : service;
}
function serviceShortName(tenantName, service, fallback, custom) {
  const short = clean(custom?.short_name);
  if (short) return short;
  const own = clean(custom?.name);
  if (own && own.length <= SHORT_NAME_MAX) return own;
  return serviceAppName(tenantName, service, fallback);
}

export { serviceAppName, serviceBrandingEntry, serviceBrandingMap, serviceShortName, tenantBrandWord };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map