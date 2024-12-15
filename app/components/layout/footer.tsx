import {
  CaretRight,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { Button } from "~/components/button";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { cn } from "~/lib/cn";
import type { SingleMenuItem } from "~/lib/type";
import { Input } from "~/modules/input";
import { CountrySelector } from "./country-selector";

let variants = cva("", {
  variants: {
    width: {
      full: "",
      stretch: "",
      fixed: "max-w-page mx-auto",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "px-3 md:px-4 lg:px-6 mx-auto",
    },
  },
});

export function Footer() {
  let { shopName } = useShopMenu();
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

  let socialItems = [
    {
      name: "Instagram",
      to: socialInstagram,
      icon: <InstagramLogo className="w-5 h-5" />,
    },
    {
      name: "X",
      to: socialX,
      icon: <XLogo className="w-5 h-5" />,
    },
    {
      name: "LinkedIn",
      to: socialLinkedIn,
      icon: <LinkedinLogo className="w-5 h-5" />,
    },
    {
      name: "Facebook",
      to: socialFacebook,
      icon: <FacebookLogo className="w-5 h-5" />,
    },
  ];

  return (
    <footer
      className={cn(
        "w-full bg-[--color-footer-bg] text-[--color-footer-text] pt-9 lg:pt-16",
        variants({ padding: footerWidth })
      )}
      style={
        {
          "--underline-color": "var(--color-footer-text)",
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "divide-y divide-line-subtle space-y-9 w-full h-full",
          variants({ width: footerWidth })
        )}
      >
        <div className="space-y-9">
          <div className="w-full grid lg:grid-cols-3 gap-8">
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
                  ) : null
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
            <div className="flex flex-col gap-6">
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
          <FooterMenu />
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

function FooterMenu() {
  let { footerMenu } = useShopMenu();
  let items = footerMenu.items as unknown as SingleMenuItem[];
  return (
    <Accordion.Root
      type="multiple"
      defaultValue={items.map(({ id }) => id)}
      className="w-full grid lg:grid-cols-3 lg:gap-8"
    >
      {items.map(({ id, to, title, items }) => (
        <Accordion.Item key={id} value={id} className="flex flex-col">
          <Accordion.Trigger className="flex py-4 justify-between items-center lg:hidden text-left font-medium [&>svg]:data-[state=open]:rotate-90">
            {["#", "/"].includes(to) ? (
              <span>{title}</span>
            ) : (
              <Link to={to}>{title}</Link>
            )}
            <CaretRight className="w-4 h-4 transition-transform rotate-0" />
          </Accordion.Trigger>
          <div className="text-lg font-medium hidden lg:block">
            {["#", "/"].includes(to) ? title : <Link to={to}>{title}</Link>}
          </div>
          <Accordion.Content
            style={
              {
                "--slide-up-from": "var(--radix-accordion-content-height)",
                "--slide-down-to": "var(--radix-accordion-content-height)",
                "--slide-up-duration": "0.15s",
                "--slide-down-duration": "0.15s",
              } as React.CSSProperties
            }
            className={clsx([
              "overflow-hidden",
              "data-[state=closed]:animate-slide-up",
              "data-[state=open]:animate-slide-down",
            ])}
          >
            <div className="pb-4 lg:pt-6 flex flex-col gap-2">
              {items.map(({ id, to, title }) => (
                <Link to={to} key={id} className="relative">
                  <span className="reveal-underline">{title}</span>
                </Link>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
