import { CaretDown } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useSearchParams } from "@remix-run/react";
import Link from "~/components/link";
import { cn } from "~/lib/cn";
import type { SortParam } from "~/lib/filter";

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

// const SEARCH_SORT: { label: string; key: SortParam }[] = [
//   {
//     label: "Relevance",
//     key: "relevance",
//   },
//   {
//     label: "Price: Low - High",
//     key: "price-low-high",
//   },
//   {
//     label: "Price: High - Low",
//     key: "price-high-low",
//   },
// ];

export function Sort() {
  let [searchParams] = useSearchParams();
  let location = useLocation();
  let sortList = PRODUCT_SORT;
  let { key: currentSortValue } =
    sortList.find(({ key }) => key === searchParams.get("sort")) || sortList[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-1.5 h-12 border px-4 py-2.5 focus-visible:outline-none">
        <span className="font-medium">Sort by</span>
        <CaretDown />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="flex h-fit w-44 flex-col gap-2 border border-line-subtle bg-background p-5"
        >
          {sortList.map(({ key, label }) => {
            let params = new URLSearchParams(searchParams);
            params.set("sort", key);
            return (
              <DropdownMenu.Item key={key} asChild>
                <Link
                  to={`${location.pathname}?${params.toString()}`}
                  className={cn(
                    "hover:underline underline-offset-[6px] hover:outline-none",
                    currentSortValue === key && "font-bold",
                  )}
                >
                  {label}
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
