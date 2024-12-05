import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CaretDown } from "@phosphor-icons/react";
import { Link, useLocation, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import type { SortParam } from "~/lib/filter";
import { getSortLink } from "~/lib/filter";

const PRODUCT_SORT: { label: string; key: SortParam }[] = [
  { label: "Featured", key: "featured" },
  {
    label: "Price: Low - High",
    key: "price-low-high",
  },
  {
    label: "Price: High - Low",
    key: "price-high-low",
  },
  {
    label: "Best Selling",
    key: "best-selling",
  },
  {
    label: "Newest",
    key: "newest",
  },
];

const SEARCH_SORT: { label: string; key: SortParam }[] = [
  {
    label: "Price: Low - High",
    key: "price-low-high",
  },
  {
    label: "Price: High - Low",
    key: "price-high-low",
  },
  {
    label: "Relevance",
    key: "relevance",
  },
];

export function Sort({
  show = false,
}: {
  show?: boolean;
}) {
  let [params] = useSearchParams();
  let location = useLocation();
  let sortList = show ? SEARCH_SORT : PRODUCT_SORT;
  let active =
    sortList.find(({ key }) => key === params.get("sort")) || sortList[0];

  return (
    <Menu as="div" className="relative z-10">
      <MenuButton className="flex items-center gap-1.5 h-10 border px-4 py-2.5">
        <span className="font-medium">Sort by</span>
        <CaretDown />
      </MenuButton>
      <MenuItems
        as="nav"
        className="absolute right-0 top-12 flex h-fit w-40 flex-col gap-2 border border-line-subtle bg-background p-5"
      >
        {sortList.map((item) => (
          <MenuItem key={item.label}>
            {() => (
              <Link to={getSortLink(item.key, params, location)}>
                <p
                  className={clsx(
                    "block text-base hover:underline underline-offset-4",
                    active?.key === item.key ? "font-bold" : "font-normal",
                  )}
                >
                  {item.label}
                </p>
              </Link>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
