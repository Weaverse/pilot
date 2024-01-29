import {useThemeSettings} from '@weaverse/hydrogen';
import {Image} from '@shopify/hydrogen';
import {Link} from './Link';

export function Logo() {
  let settings = useThemeSettings();
  let {logoData} = settings;
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
          data={logoData}
          sizes="auto"
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
}
