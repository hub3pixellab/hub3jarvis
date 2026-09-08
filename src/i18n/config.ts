import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import {
  fallbackLng,
  getLanguageDirection,
  normalizeLanguage,
  supportedLngs,
} from "./util";

export * from "./util";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

// Bundle every public/locales file at build time and pass them as synchronous
// `resources`. This makes t() return real strings on the very first paint instead
// of returning the key and re-rendering the whole tree once HttpBackend finishes
// loading. That async swap is what remounts elements keyed off translated values
// (key={t(...)}) and breaks mount-time effects (scroll/stack animations, layout
// measurement) after a reload. The preview re-imports these JSON files on every
// rebuild, so the bundled copy never goes stale; HttpBackend stays as a fallback
// for any language not covered by the bundle.
const bundledResources = Object.fromEntries(
  Object.entries(
    import.meta.glob<Record<string, string>>("../../public/locales/*.json", {
      eager: true,
      import: "default",
    }),
  ).map(([filePath, translation]) => {
    const code = filePath.match(/([^/]+)\.json$/)?.[1] ?? "";
    return [code, { translation }];
  }),
);

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    supportedLngs,
    resources: bundledResources,
    // Bundled languages resolve synchronously (no backend refetch, no re-render);
    // only a language with no bundled file falls back to HttpBackend.
    partialBundledLanguages: true,
    backend: { loadPath: `${baseUrl}locales/{{lng}}.json` },
    detection: {
      order: ["cookie", "navigator", "htmlTag"],
      lookupCookie: "i18next",
      caches: ["cookie"],
      // Normalize unsupported languages to fallbackLng to avoid persisting
      // an invalid language string (the detector caches i18n.language, not resolvedLanguage).
      convertDetectedLanguage: (l) => normalizeLanguage(l) ?? fallbackLng,
    },
    // The current template uses flat dotted keys + a single namespace.
    // Both separators are disabled so the entire string is a literal key,
    // not split into ns/key/subkey.
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

const syncDocumentLanguage = (lng: string) => {
  const code = normalizeLanguage(lng) ?? fallbackLng;
  document.documentElement.lang = code;
  document.documentElement.dir = getLanguageDirection(code);
};

i18n.on("initialized", () =>
  syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language),
);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
