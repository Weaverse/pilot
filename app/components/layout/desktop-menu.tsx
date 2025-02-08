import { CaretDown } from "@phosphor-icons/react";
import * as Menubar from "@radix-ui/react-menubar";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import { Image } from "~/components/image";
import Link from "~/components/link";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { RevealUnderline } from "~/reveal-underline";
import type { SingleMenuItem } from "~/types/menu";
import { cn } from "~/utils/cn";

export function DesktopMenu() {
  let { headerMenu } = useShopMenu();
  let { openMenuBy } = useThemeSettings();
  let [value, setValue] = useState<string | null>(null);

  if (headerMenu?.items?.length) {
    let items = headerMenu.items as unknown as SingleMenuItem[];
    return (
      <Menubar.Root
        asChild
        value={value}
        onValueChange={setValue}
        onMouseLeave={() => setValue(null)}
      >
        <nav className="hidden lg:flex grow justify-center h-full">
          {items.map((menuItem) => {
            let { id, items = [], title, to } = menuItem;
            let level = getMaxDepth(menuItem);
            let hasSubmenu = level > 1;
            let isDropdown =
              level === 2 && items.every(({ resource }) => !resource?.image);
            return (
              <Menubar.Menu key={id} value={id}>
                <Menubar.Trigger
                  asChild={!hasSubmenu}
                  className={clsx([
                    "cursor-pointer px-3 py-2 h-full flex items-center gap-1.5",
                    '[&>svg]:data-[state="open"]:rotate-180',
                    "focus:outline-none uppercase",
                  ])}
                  onMouseEnter={() => {
                    if (openMenuBy === "hover" && value !== id) {
                      setValue(id);
                    }
                  }}
                >
                  {hasSubmenu ? (
                    <>
                      <span>{title}</span>
                      <CaretDown className="w-3.5 h-3.5 transition-transform" />
                    </>
                  ) : (
                    <Link to={to} className="transition-none">
                      {title}
                    </Link>
                  )}
                </Menubar.Trigger>
                {level > 1 && (
                  <Menubar.Content
                    className={cn([
                      "px-3 md:px-4 lg:px-6",
                      "bg-[--color-header-bg] shadow-lg",
                      isDropdown ? "py-6" : "w-screen py-8",
                    ])}
                  >
                    {isDropdown ? (
                      <DropdownSubMenu items={items} />
                    ) : (
                      <MegaMenu items={items} />
                    )}
                  </Menubar.Content>
                )}
              </Menubar.Menu>
            );
          })}
        </nav>
      </Menubar.Root>
    );
  }
  return null;
}

function DropdownSubMenu({ items }: { items: SingleMenuItem[] }) {
  return (
    <ul
      className="space-y-1.5 animate-fade-in"
      style={{ "--fade-in-duration": "150ms" } as React.CSSProperties}
    >
      {items.map(({ id, to, title }) => (
        <Link
          key={id}
          to={to}
          prefetch="intent"
          className="transition-none block"
        >
          <RevealUnderline>{title}</RevealUnderline>
        </Link>
      ))}
    </ul>
  );
}

function MegaMenu({ items }: { items: SingleMenuItem[] }) {
  return (
    <div className="max-w-page mx-auto flex gap-4">
      {items.map(({ id, title, to, items: children, resource }, idx) =>
        resource?.image && children.length === 0 ? (
          <SlideIn
            key={id}
            className="grow max-w-72 w-72 bg-gray-100 aspect-square relative group/item overflow-hidden"
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <Image
              sizes="auto"
              data={resource.image}
              className="group-hover/item:scale-[1.03] transition-transform duration-300"
              width={300}
            />
            <Link
              to={to}
              prefetch="intent"
              className={clsx([
                "absolute inset-0 p-2 flex items-center justify-center text-center",
                "bg-black/20 group-hover/item:bg-black/40",
                "h6 text-body-inverse font-medium transition-all duration-300",
              ])}
            >
              {title}
            </Link>
          </SlideIn>
        ) : (
          <SlideIn
            key={id}
            className="grow max-w-72 space-y-4"
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <Link
              to={to}
              prefetch="intent"
              className="uppercase inline transition-none"
            >
              <RevealUnderline>{title}</RevealUnderline>
            </Link>
            <div className="flex flex-col gap-1.5">
              {children.map((cItem) => (
                <Link
                  key={cItem.id}
                  to={cItem.to}
                  prefetch="intent"
                  className="relative inline transition-none"
                >
                  <RevealUnderline>{cItem.title}</RevealUnderline>
                </Link>
              ))}
            </div>
          </SlideIn>
        ),
      )}
    </div>
  );
}

function SlideIn(props: {
  className?: string;
  children: React.ReactNode;
  style: React.CSSProperties;
}) {
  let { className, children, style } = props;
  return (
    <div
      className={cn(
        "opacity-0 animate-slide-left [animation-delay:calc(var(--idx)*0.1s+0.1s)]",
        className,
      )}
      style={
        {
          "--slide-left-from": "40px",
          "--slide-left-duration": "300ms",
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

function getMaxDepth(item: { items: any[] }): number {
  if (item.items?.length > 0) {
    return Math.max(...item.items.map(getMaxDepth)) + 1;
  }
  return 1;
}
