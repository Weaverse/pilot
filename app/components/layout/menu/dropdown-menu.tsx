import { CaretDownIcon } from "@phosphor-icons/react";
import { Content, Item, Root, Trigger } from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { useState } from "react";
import Link from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import type { SingleMenuItem } from "~/types/menu";

export function DropdownMenu({ menuItem }: { menuItem: SingleMenuItem }) {
  const [open, setOpen] = useState(false);
  const { items: childItems = [], title } = menuItem;
  return (
    <div onMouseLeave={() => setOpen(false)}>
      <Root open={open} onOpenChange={setOpen} modal={false}>
        <Trigger
          className={clsx([
            "flex h-full cursor-pointer items-center gap-1.5 px-3 py-2",
            "uppercase focus:outline-hidden",
            "data-[state=open]:[&>svg]:rotate-180",
          ])}
          onMouseEnter={() => {
            setOpen(true);
          }}
        >
          <span>{title}</span>
          <CaretDownIcon className="h-3.5 w-3.5 transition-transform" />
        </Trigger>
        <Content
          align="start"
          className="flex min-w-48 animate-fade-in flex-col gap-1.5 bg-(--color-header-bg) p-6 shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {childItems.map(
            ({ id: itemId, to: itemTo, title: itemTitle, isExternal }) => (
              <Item key={itemId} asChild>
                <Link
                  to={itemTo}
                  prefetch="intent"
                  className="group items-center gap-2 outline-hidden transition-none"
                >
                  <RevealUnderline>{itemTitle}</RevealUnderline>
                  {isExternal && (
                    <span className="invisible text-sm group-hover:visible">
                      ↗
                    </span>
                  )}
                </Link>
              </Item>
            ),
          )}
        </Content>
      </Root>
    </div>
  );
}
