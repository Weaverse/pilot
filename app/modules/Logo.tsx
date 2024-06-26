import { useThemeSettings } from "@weaverse/hydrogen";
import { Image } from "@shopify/hydrogen";

import { Link } from "./Link";

export function Logo({ showTransparent }: { showTransparent?: boolean }) {
  let settings = useThemeSettings();
  let logoData = settings?.logoData;
  let transparentLogoData = settings?.transparentLogoData;

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
          data={showTransparent ? transparentLogoData : logoData}
          sizes="auto"
          className={"w-full h-full object-cover"}
        />
      </div>
    </Link>
  );
}
