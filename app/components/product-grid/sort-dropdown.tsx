import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { getSortByValue } from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";
import { Icon } from "~/components/icon";
import { cn } from "~/utils/cn";

interface SortDropdownProps {
  /** `value` is a `sort_by` value from `getSortByValue`; the first option is the default sort. */
  options: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
}

/** Sort control for a `CollectionBrowseProvider` listing. */
export function SortDropdown({ options, className }: SortDropdownProps) {
  const sortByValue = useCollection((state) =>
    state.sortKey ? getSortByValue(state.sortKey, state.reverse) : null,
  );
  const { setSortByValue } = useCollectionActions();
  const currentSort =
    options.find(({ value }) => value === sortByValue) || options[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "flex h-12 items-center gap-1.5 rounded-md border px-4 py-2.5 focus-visible:outline-hidden",
          className,
        )}
      >
        <span className="hidden lg:inline">
          Sort by: <span className="font-semibold">{currentSort.label}</span>
        </span>
        <span className="lg:hidden">Sort</span>
        <Icon name="caret-down" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="bg-background flex h-fit w-44 flex-col gap-2 rounded-lg border border-gray-400 p-5 shadow"
        >
          {options.map(({ value, label }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setSortByValue(value)}
              className={cn(
                "cursor-pointer underline-offset-[6px] hover:underline hover:outline-hidden",
                currentSort.value === value && "font-bold",
              )}
            >
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
