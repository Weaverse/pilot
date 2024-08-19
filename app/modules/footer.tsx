import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import Button from "~/components/button";
import {
  IconFacebookLogo,
  IconInstagramLogo,
  IconLinkedinLogo,
  IconXLogo,
} from "~/components/icons";
import { cn } from "~/lib/cn";
import type { ChildEnhancedMenuItem, EnhancedMenu } from "~/lib/utils";
import { Input } from "~/modules/input";
import { CountrySelector } from "./country-selector";

let variants = cva("divide-y divide-line/50 space-y-9", {
  variants: {
    width: {
      full: "w-full h-full",
      stretch: "w-full h-full",
      fixed: "w-full h-full max-w-page mx-auto",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "px-3 md:px-4 lg:px-6 mx-auto",
    },
  },
});

export function Footer({
  menu,
  shopName,
}: { menu?: EnhancedMenu; shopName: string }) {
  let {
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
  } = useThemeSettings();

  let { items = [] } = menu || {};
  let socialItems = [
    {
      name: "Instagram",
      to: socialInstagram,
      icon: <IconInstagramLogo className="w-5 h-5" />,
    },
    {
      name: "X",
      to: socialX,
      icon: <IconXLogo className="w-5 h-5" />,
    },
    {
      name: "LinkedIn",
      to: socialLinkedIn,
      icon: <IconLinkedinLogo className="w-5 h-5" />,
    },
    {
      name: "Facebook",
      to: socialFacebook,
      icon: <IconFacebookLogo className="w-5 h-5" />,
    },
  ];

  return (
    <footer
      className={cn(
        "bg-[var(--color-footer-bg)] text-[var(--color-footer-text)] pt-16",
        variants({ padding: footerWidth }),
      )}
      style={
        {
          "--underline-color": "var(--color-footer-text)",
        } as React.CSSProperties
      }
    >
      <div className={variants({ width: footerWidth })}>
        <div className="space-y-9">
          <div className="w-full grid lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-6">
              {footerLogoData ? (
                <div className="relative" style={{ width: footerLogoWidth }}>
                  <Image
                    data={footerLogoData}
                    sizes="auto"
                    className="w-full h-full object-contain object-left"
                  />
                </div>
              ) : (
                <div className="font-medium text-base uppercase">
                  {shopName}
                </div>
              )}
              {bio ? <div dangerouslySetInnerHTML={{ __html: bio }} /> : null}
              <div className="flex gap-4">
                {socialItems.map((social) =>
                  social.to ? (
                    <Link
                      key={social.name}
                      to={social.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-lg"
                    >
                      {social.icon}
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="text-base">{addressTitle}</div>
              <div className="space-y-2">
                <p>{storeAddress}</p>
                <p>Email: {storeEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-6 col-span-2">
              <div className="text-base">{newsletterTitle}</div>
              <div className="space-y-2">
                <p>{newsletterDescription}</p>
                <div className="flex">
                  <Input
                    placeholder={newsletterPlaceholder}
                    className="max-w-96 text-body"
                  />
                  <Button variant="custom">{newsletterButtonText}</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full grid lg:grid-cols-4 gap-8">
            {items.map((item, ind) => (
              <div key={ind} className="flex flex-col gap-6">
                <FooterMenu
                  title={item.title}
                  to={item.to}
                  items={item.items}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="py-9 flex gap-4 flex-col lg:flex-row justify-between items-center">
          <div className="flex gap-2 ">
            <CountrySelector />
          </div>
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterMenu({
  title,
  to,
  items,
}: {
  title: string;
  to: string;
  items: ChildEnhancedMenuItem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Disclosure defaultOpen>
        <DisclosureButton className="lg:hidden text-left">
          <div className="text-base font-medium">
            {to === "#" ? title : <Link to={to}>{title}</Link>}
          </div>
        </DisclosureButton>
        <div className="text-lg font-medium hidden lg:block">
          {to === "#" ? title : <Link to={to}>{title}</Link>}
        </div>
        <DisclosurePanel>
          <div className="flex flex-col gap-2">
            {items.map((item, ind) => (
              <Link to={item.to} key={ind} className="relative">
                <span className="underline-animation">{item.title}</span>
              </Link>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
