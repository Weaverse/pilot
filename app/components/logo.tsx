import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { Link } from "~/components/link";

export function Logo({
  isTransparent,
  shopName,
}: { isTransparent?: boolean; shopName: string }) {
  let settings = useThemeSettings();
  let { logoData, transparentLogoData, logoWidth } = settings;

  return (
    <Link
      className="flex items-center justify-center w-full h-full lg:w-fit lg:h-fit z-30"
      to="/"
      prefetch="intent"
    >
      <div
        className="relative"
        style={{ width: logoData ? logoWidth : "auto" }}
      >
        {logoData ? (
          <>
            <Image
              data={logoData}
              sizes="auto"
              className={clsx(
                "w-full h-full object-cover transition-opacity duration-300 ease-in group-hover/header:opacity-100",
                isTransparent ? "opacity-0" : "opacity-100",
              )}
            />
            <Image
              data={transparentLogoData}
              sizes="auto"
              className={clsx(
                "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ease-in group-hover/header:opacity-0",
                isTransparent ? "opacity-100" : "opacity-0",
              )}
            />
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
