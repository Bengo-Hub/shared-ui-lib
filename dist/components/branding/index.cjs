'use strict';

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
  if (own) return own.length <= SHORT_NAME_MAX ? own : own.split(/\s+/).slice(0, 2).join(" ");
  return serviceAppName(tenantName, service, fallback);
}
function serviceFullName(tenantName, service, fallback, custom) {
  const own = clean(custom?.name);
  if (own) return own;
  const business = clean(tenantName) || clean(fallback);
  return business ? `${business} ${service}` : service;
}
function resolveAppIdentity(tenant, opts) {
  const meta = tenant?.metadata;
  const text = (v) => typeof v === "string" ? v.trim() : "";
  const entry = serviceBrandingEntry(meta, opts.service) ?? {};
  const businessName = text(tenant?.name) || opts.slug;
  return {
    businessName,
    appName: serviceFullName(businessName, opts.label, opts.slug, entry),
    shortName: serviceShortName(businessName, opts.label, opts.slug, entry),
    description: text(entry.tagline) || text(meta?.tagline) || opts.defaultDescription(businessName),
    themeColor: text(entry.theme_color) || text(tenant?.brand_colors?.primary) || text(meta?.primary_color) || opts.defaultThemeColor,
    backgroundColor: text(tenant?.brand_colors?.secondary) || text(meta?.secondary_color) || opts.defaultBackgroundColor || "#ffffff",
    iconUrl: text(entry.icon_url) || text(tenant?.logo_url) || text(meta?.logo_url) || null,
    custom: !!text(entry.name)
  };
}

exports.resolveAppIdentity = resolveAppIdentity;
exports.serviceAppName = serviceAppName;
exports.serviceBrandingEntry = serviceBrandingEntry;
exports.serviceBrandingMap = serviceBrandingMap;
exports.serviceFullName = serviceFullName;
exports.serviceShortName = serviceShortName;
exports.tenantBrandWord = tenantBrandWord;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map