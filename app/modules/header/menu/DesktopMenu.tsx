import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import clsx from "clsx";
import type React from "react";
import { getMaxDepth } from "~/lib/menu";
import type { SingleMenuItem } from "~/lib/type";
import type { EnhancedMenu } from "~/lib/utils";

const dropdownContentClass =
  "absolute shadow overflow-hidden bg-white z-10 dropdown-transition";

export function DesktopMenu(props: { menu: EnhancedMenu }) {
  let { menu } = props;
  let items = menu.items as unknown as SingleMenuItem[];
  if (!items) return null;
  return (
    <nav className="flex items-stretch h-full">
      {items.map((item) => {
        let { title, ...rest } = item;
        let level = getMaxDepth(item);
        let isAllResourceType =
          item.items.length &&
          item.items.every(
            (item) => item?.resource?.image && item.items.length === 0,
          );
        let Comp: React.FC<SingleMenuItem> = isAllResourceType
          ? ImageMenu
          : level > 2
            ? MultiMenu
            : level === 2
              ? SingleMenu
              : GroupWrapper;

        return <Comp key={item.id} title={title} {...rest} />;
      })}
    </nav>
  );
}

function MultiMenu(props: SingleMenuItem) {
  let { title, items, to } = props;

  let renderList = (item: SingleMenuItem, idx: number) => (
    <div
      className="flex-1 fly-in max-w-60 space-y-4"
      key={idx}
      style={{ "--item-index": idx } as { [key: string]: any }}
    >
      <Link to={item.to} prefetch="intent" className="uppercase">
        <span className="text-animation">{item.title}</span>
      </Link>
      <ul className="space-y-1.5">
        {item.items.map((subItem) => (
          <li key={subItem.id} className="leading-6">
            <Link to={subItem.to} prefetch="intent" className="relative">
              <span className="text-animation">{subItem.title}</span>
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
      style={{ "--item-index": idx } as { [key: string]: any }}
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
    <GroupWrapper title={title} to={to}>
      <div className={clsx("w-screen top-full left-0", dropdownContentClass)}>
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
    </GroupWrapper>
  );
}

function SingleMenu(props: SingleMenuItem) {
  let { title, items, to } = props;
  return (
    <GroupWrapper title={title} to={to} className="relative">
      <div
        className={clsx(
          "top-full -left-3 group-hover:h-auto",
          dropdownContentClass,
        )}
      >
        <div className="p-6 space-y-4 min-w-48">
          <Link to={to} prefetch="intent" className="uppercase">
            <span className="text-animation">{title}</span>
          </Link>
          <ul className="space-y-1.5">
            {items.map((subItem) => (
              <li key={subItem.id} className="leading-6">
                <Link to={subItem.to} prefetch="intent">
                  <span className="text-animation">{subItem.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GroupWrapper>
  );
}

function ImageMenu({ title, items, to }: SingleMenuItem) {
  return (
    <GroupWrapper title={title} to={to}>
      <div className={clsx("w-screen top-full left-0", dropdownContentClass)}>
        <div className="py-8">
          <div className="flex gap-6 w-fit container mx-auto">
            {items.map((item, id) => (
              <Link
                to={item.to}
                prefetch="intent"
                key={item.id}
                className="flex-1 fly-in"
                style={{ "--item-index": id } as { [key: string]: any }}
              >
                <div className="aspect-square relative group/item overflow-hidden">
                  <Image
                    data={item?.resource?.image}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                    sizes="auto"
                  />
                  <div className="absolute w-full inset-0 text-center text-white font-medium pointer-events-none p-2 bg-black/15 group-hover/item:bg-black/30 flex items-center justify-center transition-all duration-300">
                    {item.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </GroupWrapper>
  );
}

function GroupHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="h-full flex items-center px-3 cursor-pointer relative z-30">
      <Link to={to} className="py-2">
        <span className="uppercase text-animation group/header">{title}</span>
      </Link>
    </div>
  );
}

function GroupWrapper(props: {
  children?: React.ReactNode;
  className?: string;
  title: string;
  to: string;
}) {
  let { children, className, title, to } = props;
  return (
    <div className={clsx("group", className)}>
      <GroupHeader title={title} to={to} />
      {children}
    </div>
  );
}
