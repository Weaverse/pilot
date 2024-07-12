import { useThemeSettings } from "@weaverse/hydrogen";
import { Image } from "@shopify/hydrogen";

import { Link } from "./Link";
import clsx from "clsx";

export function Logo({ showTransparent }: { showTransparent?: boolean }) {
  let settings = useThemeSettings();
  let logoData = settings?.logoData;
  let transparentLogoData = settings?.transparentLogoData;

  if (!logoData) {
    return null;
  }
  return (
    <Link
      className="flex items-center justify-center w-full h-full lg:w-fit lg:h-fit z-30"
      to="/"
      prefetch="intent"
    >
      <div className="max-w-[120px] relative">
        <Image
          data={logoData}
          sizes="auto"
          className={clsx(
            "w-full h-full object-cover transition-opacity duration-300 ease-in group-hover/header:opacity-100",
            showTransparent ? "opacity-0" : "opacity-100",
          )}
        />
        <Image
          data={transparentLogoData}
          sizes="auto"
          className={
            clsx(
              "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ease-in group-hover/header:opacity-0",
              showTransparent ? "opacity-100" : "opacity-0",
            )
          }
        />
      </div>
    </Link>
  );
}
