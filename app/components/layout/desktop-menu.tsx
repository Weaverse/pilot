import { CaretDownIcon } from "@phosphor-icons/react";
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
  const { headerMenu } = useShopMenu();
  const { openMenuBy } = useThemeSettings();
  const [value, setValue] = useState<string | null>(null);

  if (headerMenu?.items?.length) {
    const items = headerMenu.items as unknown as SingleMenuItem[];
    return (
      <Menubar.Root
        asChild
        value={value}
        onValueChange={setValue}
        onMouseLeave={() => setValue(null)}
      >
        <nav className="hidden h-full grow justify-center lg:flex">
          {items.map((menuItem) => {
            const { id, items: childItems = [], title, to } = menuItem;
            const level = getMaxDepth(menuItem);
            const hasSubmenu = level > 1;
            const isDropdown =
              level === 2 &&
              childItems.every(({ resource }) => !resource?.image);
            return (
              <Menubar.Menu key={id} value={id}>
                <Menubar.Trigger
                  asChild={!hasSubmenu}
                  className={clsx([
                    "flex h-full cursor-pointer items-center gap-1.5 px-3 py-2",
                    'data-[state="open"]:[&>svg]:rotate-180',
                    "uppercase focus:outline-hidden",
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
                      <CaretDownIcon className="h-3.5 w-3.5 transition-transform" />
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
                      "bg-(--color-header-bg) shadow-lg",
                      isDropdown ? "py-6" : "w-screen py-8",
                    ])}
                  >
                    {isDropdown ? (
                      <DropdownSubMenu items={childItems} />
                    ) : (
                      <MegaMenu items={childItems} />
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
      className="animate-fade-in space-y-1.5"
      style={{ "--fade-in-duration": "150ms" } as React.CSSProperties}
    >
      {items.map(({ id, to, title }) => (
        <Link
          key={id}
          to={to}
          prefetch="intent"
          className="block transition-none"
        >
          <RevealUnderline>{title}</RevealUnderline>
        </Link>
      ))}
    </ul>
  );
}

function MegaMenu({ items }: { items: SingleMenuItem[] }) {
  return (
    <div className="mx-auto flex max-w-(--page-width) gap-4">
      {items.map(({ id, title, to, items: children, resource }, idx) =>
        resource?.image && children.length === 0 ? (
          <SlideIn
            key={id}
            className="group/item relative aspect-square w-72 max-w-72 grow overflow-hidden bg-gray-100"
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <Image
              sizes="auto"
              data={resource.image}
              className="transition-transform duration-300 group-hover/item:scale-[1.03]"
              width={300}
            />
            <Link
              to={to}
              prefetch="intent"
              className={clsx([
                "absolute inset-0 flex items-center justify-center p-2 text-center",
                "bg-black/20 group-hover/item:bg-black/40",
                "h6 text-body-inverse transition-all duration-300",
              ])}
            >
              {title}
            </Link>
          </SlideIn>
        ) : (
          <SlideIn
            key={id}
            className="max-w-72 grow space-y-4"
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <Link
              to={to}
              prefetch="intent"
              className="uppercase transition-none"
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
  const { className, children, style } = props;
  return (
    <div
      className={cn(
        "animate-slide-left opacity-0 [animation-delay:calc(var(--idx)*0.1s+0.1s)]",
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
