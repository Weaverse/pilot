import clsx from "clsx";
import { useRef } from "react";
import useScroll from "react-use/esm/useScroll";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import type { CartLayoutType } from "~/types/others";
import { CartBestSellers } from "./cart-best-sellers";

export function CartEmpty({
  hidden = false,
  layout = "drawer",
  onClose,
}: {
  hidden: boolean;
  layout?: CartLayoutType;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);
  return (
    <div
      ref={scrollRef}
      className={clsx(
        layout === "drawer" && [
          "h-screen-dynamic w-[400px] flex flex-col justify-center text-center content-start space-y-12 overflow-y-scroll px-5 pb-5 transition",
          y > 0 && "border-t",
        ],
        layout === "page" && [
          "w-full gap-4 pb-12 md:items-start md:gap-8 lg:gap-12",
        ],
      )}
      hidden={hidden}
    >
      <div className={clsx(layout === "page" && "text-center")}>
        <p className="mb-4">
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </p>
        <Link
          variant="outline"
          to="/products"
          className={clsx(
            layout === "drawer" ? "w-full" : "min-w-48",
            "justify-center",
          )}
          onClick={onClose}
        >
          Start Shopping
        </Link>
      </div>
      {layout === "page" && (
        <Section width="fixed" verticalPadding="medium">
          <div className="grid gap-4">
            <CartBestSellers
              count={4}
              heading="Shop Best Sellers"
              sortKey="BEST_SELLING"
            />
          </div>
        </Section>
      )}
    </div>
  );
}
