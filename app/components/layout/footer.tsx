import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { cva } from "class-variance-authority";
import { useFetcher } from "react-router";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import Link from "~/components/link";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { cn } from "~/utils/cn";
import { CountrySelector } from "./country-selector";
import { FooterMenu } from "./menu/footer-menu";

const variants = cva("", {
  variants: {
    width: {
      full: "",
      stretch: "",
      fixed: "mx-auto max-w-(--page-width)",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "mx-auto px-3 md:px-4 lg:px-6",
    },
  },
});

export function Footer() {
  const { shopName } = useShopMenu();
  const {
    footerWidth,
    socialFacebook,
    socialInstagram,
    socialLinkedIn,
    socialX,
    footerLogoData,
    footerLogoWidth,
  } = useThemeSettings();
  const { t } = useTranslation("common");
  const fetcher = useFetcher<{ ok: boolean; error: string }>();

  // Compute message and error from fetcher data
  const message = fetcher.data?.ok ? t("footer.newsletterSuccess") : "";
  const error =
    fetcher.data && !fetcher.data.ok
      ? fetcher.data.error || t("footer.newsletterError")
      : "";

  const SOCIAL_ACCOUNTS = [
    {
      name: "Instagram",
      to: socialInstagram,
      Icon: InstagramLogoIcon,
    },
    {
      name: "X",
      to: socialX,
      Icon: XLogoIcon,
    },
    {
      name: "LinkedIn",
      to: socialLinkedIn,
      Icon: LinkedinLogoIcon,
    },
    {
      name: "Facebook",
      to: socialFacebook,
      Icon: FacebookLogoIcon,
    },
  ].filter((acc) => acc.to && acc.to.trim() !== "");

  return (
    <footer
      className={cn(
        "w-full bg-(--color-footer-bg) pt-9 text-(--color-footer-text) lg:pt-16",
        variants({ padding: footerWidth }),
      )}
    >
      <div
        className={cn(
          "h-full w-full space-y-9",
          variants({ width: footerWidth }),
        )}
      >
        <div className="space-y-9">
          <div className="grid w-full gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              {footerLogoData ? (
                <div className="relative" style={{ width: footerLogoWidth }}>
                  <Image
                    data={footerLogoData}
                    sizes="auto"
                    width={500}
                    className="h-full w-full object-contain object-left"
                  />
                </div>
              ) : (
                <div className="font-medium text-base uppercase">
                  {shopName}
                </div>
              )}
              {t("footer.bio") ? <div dangerouslySetInnerHTML={{ __html: t("footer.bio") }} /> : null}
              <div className="flex gap-4">
                {SOCIAL_ACCOUNTS.map(({ to, name, Icon }) => (
                  <Link
                    key={name}
                    to={to}
                    target="_blank"
                    className="flex items-center gap-2 text-lg"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="text-base">{t("footer.addressTitle")}</div>
              <div className="space-y-2">
                <p>{t("footer.storeAddress")}</p>
                <p>{t("footer.email")} {t("footer.storeEmail")}</p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="text-base">{t("footer.newsletterTitle")}</div>
              <div className="space-y-2">
                <p>{t("footer.newsletterDescription")}</p>
                <fetcher.Form
                  action="/api/klaviyo"
                  method="POST"
                  encType="multipart/form-data"
                >
                  <div className="flex">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder={t("footer.newsletterPlaceholder")}
                      className="grow border border-gray-100 px-3 focus-visible:outline-hidden"
                    />
                    <Button
                      variant="custom"
                      type="submit"
                      loading={fetcher.state === "submitting"}
                    >
                      {t("footer.newsletterButtonText")}
                    </Button>
                  </div>
                </fetcher.Form>
                <div className="h-8">
                  {message && (
                    <Banner variant="success" className="mb-6">
                      {message}
                    </Banner>
                  )}
                  {error && (
                    <Banner variant="error" className="mb-6">
                      {error}
                    </Banner>
                  )}
                </div>
              </div>
            </div>
          </div>
          <FooterMenu />
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-line-subtle border-t py-9 lg:flex-row">
          <div className="flex gap-2">
            <CountrySelector />
          </div>
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
