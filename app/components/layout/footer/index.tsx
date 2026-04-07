import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import { CountrySelector } from "../country-selector";
import { FooterMenu } from "../menu/footer-menu";
import { NewsletterForm } from "./newsletter-form";
import { PaymentMethods } from "./payment-methods";
import { SocialLinks } from "./social-links";
import { StoreInfo } from "./store-info";

const footerVariants = cva("", {
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
    bio,
    copyright,
    addressTitle,
    storeAddress,
    storeEmail,
    newsletterTitle,
    newsletterDescription,
    newsletterPlaceholder,
    newsletterButtonText,
    showPaymentMethods,
    showAmazonPay,
    showPayPal,
    showKlarna,
    showGooglePay,
    showApplePay,
    showJCB,
    showAmericanExpress,
    showVisa,
    showMastercard,
    showDiners,
    showDiscover,
    showAlipay,
  } = useThemeSettings<ThemeSettings>();

  return (
    <footer
      className={cn(
        "w-full bg-(--color-footer-bg) pt-9 text-(--color-footer-text) lg:pt-16",
        footerVariants({ padding: footerWidth }),
      )}
    >
      <div
        className={cn(
          "h-full w-full space-y-9",
          footerVariants({ width: footerWidth }),
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
              {bio ? <div dangerouslySetInnerHTML={{ __html: bio }} /> : null}
              <SocialLinks
                socialInstagram={socialInstagram}
                socialX={socialX}
                socialLinkedIn={socialLinkedIn}
                socialFacebook={socialFacebook}
              />
            </div>
            <StoreInfo
              addressTitle={addressTitle}
              storeAddress={storeAddress}
              storeEmail={storeEmail}
            />
            <NewsletterForm
              title={newsletterTitle}
              description={newsletterDescription}
              placeholder={newsletterPlaceholder}
              buttonText={newsletterButtonText}
            />
          </div>
          <FooterMenu />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-line-subtle border-t py-9">
          <div className="flex gap-2">
            <CountrySelector />
          </div>
          <p>{copyright}</p>
          <PaymentMethods
            showPaymentMethods={showPaymentMethods}
            showAmazonPay={showAmazonPay}
            showPayPal={showPayPal}
            showKlarna={showKlarna}
            showGooglePay={showGooglePay}
            showApplePay={showApplePay}
            showJCB={showJCB}
            showAmericanExpress={showAmericanExpress}
            showVisa={showVisa}
            showMastercard={showMastercard}
            showDiners={showDiners}
            showDiscover={showDiscover}
            showAlipay={showAlipay}
          />
        </div>
      </div>
    </footer>
  );
}
