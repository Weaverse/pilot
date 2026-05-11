import { WeaverseI18nServer } from "@weaverse/i18n/server";
import de from "~/i18n/de.json";
import en from "~/i18n/en.json";
import es from "~/i18n/es.json";
import fr from "~/i18n/fr.json";
import ja from "~/i18n/ja.json";
import vi from "~/i18n/vi.json";
import zh from "~/i18n/zh.json";
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
        en: { common: en },
        zh: { common: zh },
        de: { common: de },
        es: { common: es },
        fr: { common: fr },
        ja: { common: ja },
        vi: { common: vi },
      } as any,
    });
  }
  return _i18nServer;
}
