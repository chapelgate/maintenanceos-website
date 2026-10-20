import type { Locale } from "@/i18n/config";

const dictionaries = {
  "en-GB": () => import("./en-GB").then((module) => module.dictionary),
  "en-US": () => import("./en-US").then((module) => module.dictionary),
  "cy-GB": () => import("./cy-GB").then((module) => module.dictionary),
  "fr-FR": () => import("./fr-FR").then((module) => module.dictionary),
  "de-DE": () => import("./de-DE").then((module) => module.dictionary),
};

export type Dictionary = Record<string, unknown>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) {
    return dictionaries["en-GB"]();
  }
  return loader();
}