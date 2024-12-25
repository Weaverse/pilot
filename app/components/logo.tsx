import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { Link } from "~/components/link";
import { useShopMenu } from "~/hooks/use-shop-menu";

export function Logo() {
  let { shopName } = useShopMenu();
  let { logoData, transparentLogoData, logoWidth } = useThemeSettings();

  return (
    <Link
      to="/"
      prefetch="intent"
      className="flex items-center justify-center w-full h-full lg:w-fit lg:h-fit z-30"
    >
      <div
        className="relative h-full"
        style={{ width: logoData ? logoWidth : "auto" }}
      >
        {logoData ? (
          <>
            <Image
              data={logoData}
              sizes="auto"
              className={clsx(
                "main-logo",
                "max-w-full h-full object-contain mx-auto",
                "transition-opacity duration-300 ease-in group-hover/header:opacity-100"
              )}
              width={500}
              style={{ width: "auto" }}
            />
            {transparentLogoData && (
              <Image
                data={transparentLogoData}
                sizes="auto"
                className={clsx(
                  "transparent-logo",
                  "absolute top-0 left-0 max-w-full h-full object-contain mx-auto",
                  "transition-opacity duration-300 ease-in group-hover/header:opacity-0"
                )}
                width={500}
                style={{ width: "auto" }}
              />
            )}
          </>
        ) : (
          <div className="text-lg sm:text-2xl font-medium line-clamp-1">
            {shopName}
          </div>
        )}
      </div>
    </Link>
  );
}
