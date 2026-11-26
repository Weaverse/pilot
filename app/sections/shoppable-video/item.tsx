import { gql } from "@shopify/hydrogen";
import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseComponentLoaderArgs,
  type WeaverseComponentProps,
  type WeaverseImage,
  type WeaverseProduct,
  type WeaverseVideo,
} from "@weaverse/hydrogen/react-router";
import { useEffect, useRef } from "react";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Money } from "~/components/money";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

const SHOPPABLE_VIDEO_PRODUCT_QUERY = gql(`
  query shoppableVideoProduct($country: CountryCode, $language: LanguageCode, $handle: String!)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`);

interface ShoppableVideoItemData {
  video: WeaverseVideo;
  videoUrl: string;
  poster: WeaverseImage | string;
  product: WeaverseProduct;
}

interface ShoppableVideoItemProps
  extends
    WeaverseComponentProps<Awaited<ReturnType<typeof loader>>>,
    ShoppableVideoItemData {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A vertical video that plays muted while it is on screen, with a card
 * linking to its product. Tapping the video pauses or resumes it; visitors
 * with reduced motion start it themselves.
 */
export default function ShoppableVideoItem(props: ShoppableVideoItemProps) {
  // `product` is only read by the loader; keep it off the DOM.
  let {
    ref,
    video,
    videoUrl,
    poster,
    product: _product,
    loaderData,
    ...rest
  } = props;
  let videoRef = useRef<HTMLVideoElement>(null);
  let src = video?.url || videoUrl;
  let posterData =
    typeof poster === "string" ? { url: poster, altText: "" } : poster;
  let item = loaderData?.product;

  useEffect(() => {
    let el = videoRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  function togglePlay() {
    let el = videoRef.current;
    if (el?.paused) {
      el.play().catch(() => {});
    } else {
      el?.pause();
    }
  }

  return (
    <div
      ref={ref}
      {...rest}
      className="relative aspect-9/16 w-[min(70vw,18rem)] shrink-0 snap-start overflow-hidden rounded-(--radius) bg-gray-100"
    >
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={posterData?.url}
          muted
          loop
          playsInline
          preload="metadata"
          onClick={togglePlay}
          className="h-full w-full cursor-pointer object-cover"
        />
      ) : (
        posterData?.url && (
          <Image
            data={posterData}
            sizes="18rem"
            className="h-full w-full object-cover"
          />
        )
      )}
      {item && (
        <Link
          to={`/products/${item.handle}`}
          animate={false}
          className="absolute inset-x-3 bottom-3 flex items-center gap-3 bg-white/90 p-2 text-sm backdrop-blur-sm"
        >
          {item.featuredImage && (
            <Image
              data={item.featuredImage}
              sizes="48px"
              className="h-12 w-12 shrink-0 rounded-sm object-cover"
            />
          )}
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.title}</span>
            <Money as="span" data={item.priceRange.minVariantPrice} />
          </span>
        </Link>
      )}
    </div>
  );
}

export async function loader({
  weaverse,
  data,
}: WeaverseComponentLoaderArgs<ShoppableVideoItemData>) {
  if (!data?.product?.handle) {
    return null;
  }
  return unwrapStorefront(
    await weaverse.storefront.graphql(SHOPPABLE_VIDEO_PRODUCT_QUERY, {
      variables: { handle: data.product.handle },
      cache: CACHE_DEFAULT,
    }),
  );
}

export const schema = createSchema({
  type: "shoppable-video--item",
  title: "Video",
  settings: [
    {
      group: "Video",
      inputs: [
        {
          type: "video",
          name: "video",
          label: "Video",
          helpText: "A vertical (9:16) video works best.",
        },
        {
          type: "url",
          name: "videoUrl",
          label: "Video URL",
          helpText: "Used when no video is selected. Link to an MP4 file.",
        },
        {
          type: "image",
          name: "poster",
          label: "Poster image",
          helpText: "Shown before the video loads, or instead of it.",
        },
        {
          type: "product",
          name: "product",
          label: "Product",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  presets: {
    poster: IMAGES_PLACEHOLDERS.product_1,
  },
});
