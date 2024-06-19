import { useThemeSettings } from "@weaverse/hydrogen";
import { Image } from "@shopify/hydrogen";
import useWindowScroll from "react-use/esm/useWindowScroll";

import { Link } from "./Link";

export function Logo() {
  let settings = useThemeSettings();
  let enableTransparent = settings?.enableTransparentHeader;
  let logoData = settings?.logoData;
  let transparentLogoData = settings?.transparentLogoData;
  const { y } = useWindowScroll();
  let isTransparent = enableTransparent && y < 50;

  if (!logoData) {
    return null;
  }
  return (
    <Link
      className="flex items-center justify-center w-full h-full lg:w-fit lg:h-fit"
      to="/"
      prefetch="intent"
    >
      <div className="max-w-[120px]">
        <Image
          data={isTransparent ? transparentLogoData : logoData}
          sizes="auto"
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
}
