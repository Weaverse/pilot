import { WeaverseI18nServer } from "@weaverse/i18n/server";
import en from "~/i18n/en.json";
import { COUNTRIES } from "~/utils/const";

const supportedLngs = Object.values(COUNTRIES).map((c) =>
  c.language.toLowerCase(),
);

let _i18nServer: WeaverseI18nServer | null = null;

export function getI18nServer(env: Env) {
  if (!_i18nServer) {
    _i18nServer = new WeaverseI18nServer({
      host: env.WEAVERSE_HOST,
      projectId: env.WEAVERSE_PROJECT_ID,
      supportedLngs,
      fallbackLng: "en",
      defaultNS: "common",
      bundledResources: {
        en: {
          common: en,
        },
      } as any,
    });
  }
  return _i18nServer;
}
