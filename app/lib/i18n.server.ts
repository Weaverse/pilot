import { WeaverseI18nServer } from "@weaverse/i18n/server";
import en from "~/i18n/en.json";
import { COUNTRIES } from "~/utils/const";

const supportedLngs = Object.values(COUNTRIES).map((c) =>
    c.language.toLowerCase(),
);

const apiHost = process.env.WEAVERSE_HOST || "https://weaverse.io";
const apiUrl = `${apiHost}/api/translation/static?projectId={{projectId}}&locale={{lng}}-{{country}}`;

export const i18nServer = new WeaverseI18nServer({
    supportedLngs,
    fallbackLng: "en",
    defaultNS: "common",
    apiUrl,
    bundledResources: {
        en: {
            common: en,
        }
    } as any,
});
