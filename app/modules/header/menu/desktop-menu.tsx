import { Image } from "@shopify/hydrogen";
import clsx from "clsx";
import React from "react";
import { IconCaretDown } from "~/components/icons";
import { getMaxDepth } from "~/lib/menu";
import type { SingleMenuItem } from "~/lib/type";
import type { EnhancedMenu } from "~/lib/utils";
import { Link } from "~/components/link";

export function DesktopMenu({ menu }: { menu: EnhancedMenu }) {
  let items = menu.items as unknown as SingleMenuItem[];
  if (!items) return null;
  return (
    <nav className="flex items-stretch h-full">
      {items.map((item) => {
        let { id, items = [] } = item;
        let level = getMaxDepth(item);
        let isAllImageItems =
          items.length &&
          items.every(
            (childItem) =>
              childItem?.resource?.image && childItem.items.length === 0,
          );
        let MenuComponent: React.FC<SingleMenuItem> = isAllImageItems
          ? ImagesMenu
          : level > 2
            ? MegaMenu
            : level === 2
              ? DropdownMenu
              : FirstLevelMenu;

        return <MenuComponent key={id} {...item} />;
      })}
    </nav>
  );
}

function MegaMenu({ title, items, to }: SingleMenuItem) {
  let renderList = (item: SingleMenuItem, idx: number) => (
    <div
      key={item.id}
      className="flex-1 fly-in max-w-60 space-y-4"
      style={{ "--item-index": idx } as React.CSSProperties}
    >
      <Link to={item.to} prefetch="intent" className="uppercase">
        <span className="underline-animation">{item.title}</span>
      </Link>
      <ul className="space-y-1.5">
        {item.items.map((subItem) => (
          <li key={subItem.id} className="leading-6">
            <Link to={subItem.to} prefetch="intent" className="relative">
              <span className="underline-animation">{subItem.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  let renderImageItem = (item: SingleMenuItem, idx: number) => (
    <div
      className="flex-1 w-full aspect-[4/5] relative group/item overflow-hidden fly-in max-w-60"
      key={idx}
      style={{ "--item-index": idx } as React.CSSProperties}
    >
      <Link to={item.to} prefetch="intent">
        <Image
          sizes="auto"
          data={item.resource?.image}
          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
        />
      </Link>
      <div className="absolute w-full inset-0 text-center text-white font-medium pointer-events-none p-2 bg-black/15 group-hover/item:bg-black/30 flex items-center justify-center transition-all duration-300">
        {item.title}
      </div>
    </div>
  );
  return (
    <FirstLevelMenu title={title} to={to}>
      <div className="w-screen top-full left-0 absolute shadow-lg overflow-hidden bg-white z-10 dropdown-transition">
        <div className="container mx-auto py-8">
          <div className="flex gap-4 w-full">
            {items.map((item, id) =>
              item.resource && item.items.length === 0
                ? renderImageItem(item, id)
                : renderList(item, id),
            )}
          </div>
          <div className="flex gap-6" />
        </div>
      </div>
    </FirstLevelMenu>
  );
}

function DropdownMenu(props: SingleMenuItem) {
  let { title, items, to } = props;
  return (
    <FirstLevelMenu title={title} to={to} className="relative">
      <div className="top-full -left-3 group-hover:h-auto absolute shadow-lg overflow-hidden bg-white z-10 dropdown-transition">
        <div className="p-6 min-w-48">
          <ul className="space-y-1.5">
            {items.map((childItem) => (
              <li key={childItem.id} className="leading-6">
                <Link to={childItem.to} prefetch="intent">
                  <span className="underline-animation">{childItem.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FirstLevelMenu>
  );
}

function ImagesMenu({ title, items, to }: SingleMenuItem) {
  return (
    <FirstLevelMenu title={title} to={to}>
      <div className="w-screen top-full left-0 absolute shadow-lg overflow-hidden bg-white z-10 dropdown-transition">
        <div className="py-8">
          <div className="flex gap-6 w-fit container mx-auto">
            {items.map((item, id) => (
              <Link
                to={item.to}
                prefetch="intent"
                key={item.id}
                className="flex-1 fly-in"
                style={{ "--item-index": id } as React.CSSProperties}
              >
                <div className="aspect-square relative group/item overflow-hidden">
                  <Image
                    data={item?.resource?.image}
                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-400"
                    sizes="auto"
                  />
                  <h6 className="absolute w-full inset-0 text-center text-background p-2 bg-body/15 group-hover/item:bg-body/40 flex items-center justify-center transition-all duration-300">
                    {item.title}
                  </h6>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </FirstLevelMenu>
  );
}

function FirstLevelMenu(props: {
  className?: string;
  title: string;
  to: string;
  children?: React.ReactNode;
}) {
  let { children, className, title, to } = props;
  let hasChild = React.Children.count(children) > 0;
  return (
    <div className={clsx("group", className)}>
      <div className="h-full flex items-center px-3 cursor-pointer relative z-30">
        <Link to={to} className="py-2 flex items-center gap-1.5">
          <span className="uppercase underline-animation !pb-[5px]">
            {title}
          </span>
          {hasChild && (
            <IconCaretDown className="w-3 h-3 mb-[3px] group-hover:rotate-180 transition-transform duration-400" />
          )}
        </Link>
      </div>
      {children}
    </div>
  );
}
