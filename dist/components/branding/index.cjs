'use strict';

// src/components/branding/service-name.ts
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
function tenantBrandWord(tenantName) {
  const words = (tenantName ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length > 1 && LEADING_WORDS.has(words[0].toLowerCase())) {
    return `${words[0]} ${words[1]}`;
  }
  return words[0];
}
function serviceAppName(tenantName, service, fallback) {
  const word = tenantBrandWord(tenantName) || (fallback ?? "").trim();
  return word ? `${word} ${service}` : service;
}

exports.serviceAppName = serviceAppName;
exports.tenantBrandWord = tenantBrandWord;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map