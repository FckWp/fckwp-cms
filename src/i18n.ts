import i18n from "i18next";
import type {
  BackendModule,
  ReadCallback,
  InitOptions,
  Services,
  ModuleType,
} from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pb from "@/lib/pb";

import translationEN from "./admin/locales/en.json";
import translationHU from "./admin/locales/hu.json";

const staticResources: Record<string, Record<string, string>> = {
  en: translationEN,
  hu: translationHU,
};

const dynamicCache: Record<string, Record<string, string>> = {};

class PocketBaseBackend implements BackendModule {
  public static type: ModuleType = "backend";
  public type: ModuleType = "backend";

  constructor(
    services?: Services,
    backendOptions: any = {},
    i18nextOptions: InitOptions = {}
  ) {
    if (services) this.init(services, backendOptions, i18nextOptions);
  }

  init(
    _services: Services,
    _backendOptions: any,
    _i18nextOptions: InitOptions
  ) {
  }

  read(language: string, namespace: string, callback: ReadCallback) {
    if (dynamicCache[language]) {
      const merged = {
        ...(staticResources[language] || {}),
        ...dynamicCache[language],
      };
      callback(null, merged);
      return;
    }

    pb.collection("texts")
      .getFullList({ filter: `lang = "${language}"` })
      .then((records: any[]) => {
        const dynamic = records.reduce<Record<string, string>>((acc, rec) => {
          acc[rec.key] = rec.content;
          return acc;
        }, {});

        dynamicCache[language] = dynamic; // cache-eljük

        const merged = {
          ...(staticResources[language] || {}),
          ...dynamic,
        };
        callback(null, merged);
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[i18n backend] dynamic load failed:", err);
        }
        const merged = {
          ...(staticResources[language] || {}),
        };
        callback(null, merged);
      });
  }
}

if (!i18n.isInitialized) {
  i18n
    .use(PocketBaseBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      debug: process.env.NODE_ENV === "development",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupQuerystring: undefined,
      },
    });
}

export default i18n;
