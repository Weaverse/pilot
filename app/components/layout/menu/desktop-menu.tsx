import { CaretDownIcon } from "@phosphor-icons/react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import clsx from "clsx";
import { useState } from "react";
import { Image } from "~/components/image";
import Link from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { SingleMenuItem } from "~/types/menu";
import { cn } from "~/utils/cn";
import { DropdownMenu } from "./dropdown-menu";

export function DesktopMenu() {
  const { headerMenu } = useShopMenu();
  const [value, setValue] = useState<string>("");

  if (headerMenu?.items?.length) {
    const items = headerMenu.items as unknown as SingleMenuItem[];

    return (
      <NavigationMenu.Root value={value} onValueChange={setValue}>
        <NavigationMenu.List className="hidden h-full grow justify-center lg:flex">
          {items.map((menuItem) => {
            const { id, items: childItems = [], title, to } = menuItem;
            const level = getMaxDepth(menuItem);
            const hasSubmenu = level > 1;
            const isDropdown =
              level === 2 &&
              childItems.every(({ resource }) => !resource?.image);

            if (isDropdown) {
              return <DropdownMenu key={id} menuItem={menuItem} />;
            }

            // Use NavigationMenu for mega menu items and items without submenu
            return (
              <NavigationMenu.Item key={id} value={id}>
                <NavigationMenu.Trigger
                  className={clsx([
                    "flex h-full cursor-pointer items-center gap-1.5 px-3 py-2",
                    'data-[state="open"]:[&>svg]:rotate-180',
                    "uppercase focus:outline-hidden",
                  ])}
                >
                  {hasSubmenu ? (
                    <>
                      <span>{title}</span>
                      <CaretDownIcon className="h-3.5 w-3.5 transition-transform" />
                    </>
                  ) : (
                    <NavigationMenu.Link asChild>
                      <Link to={to} className="transition-none">
                        {title}
                      </Link>
                    </NavigationMenu.Link>
                  )}
                </NavigationMenu.Trigger>
                {level > 1 && (
                  <NavigationMenu.Content
                    className={cn([
                      "absolute top-0 left-0 w-full",
                      "px-3 py-8 md:px-4 lg:px-6",
                    ])}
                  >
                    <MegaMenu items={childItems} />
                  </NavigationMenu.Content>
                )}
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
        <div className="absolute inset-x-0 top-full flex w-full justify-center shadow-header">
          <NavigationMenu.Viewport
            className={cn(
              "relative origin-[top_center] overflow-hidden bg-(--color-header-bg)",
              "data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in",
              "transition-[width,height] duration-200",
              "h-(--radix-navigation-menu-viewport-height) w-full",
            )}
          />
        </div>
      </NavigationMenu.Root>
    );
  }
  return null;
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
            <NavigationMenu.Link asChild>
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
            </NavigationMenu.Link>
          </SlideIn>
        ) : (
          <SlideIn
            key={id}
            className="max-w-72 grow space-y-4"
            style={{ "--idx": idx } as React.CSSProperties}
          >
            <NavigationMenu.Link asChild>
              <Link
                to={to}
                prefetch="intent"
                className="uppercase transition-none"
              >
                <RevealUnderline>{title}</RevealUnderline>
              </Link>
            </NavigationMenu.Link>
            <div className="flex flex-col gap-1.5">
              {children.map((cItem) => (
                <div key={cItem.id}>
                  <NavigationMenu.Link asChild>
                    <Link
                      to={cItem.to}
                      prefetch="intent"
                      className="group relative items-center gap-2 transition-none"
                    >
                      <RevealUnderline>{cItem.title}</RevealUnderline>
                      {cItem.isExternal && (
                        <span className="invisible text-sm group-hover:visible">
                          ↗
                        </span>
                      )}
                    </Link>
                  </NavigationMenu.Link>
                </div>
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
        "[animation-delay:calc(var(--idx)*100ms+100ms)]",
        "animate-slide-left [--slide-left-from:40px] [animation-duration:200ms]",
        "opacity-0",
        className,
      )}
      style={style}
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
