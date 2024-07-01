import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import clsx from "clsx";
import React from "react";
import { getMaxDepth } from "~/lib/menu";
import type { SingleMenuItem } from "~/lib/type";
import type { EnhancedMenu } from "~/lib/utils";

const dropdownContentClass =
  "absolute overflow-hidden bg-white shadow-md z-10 dropdown-transition border-t";

export function DesktopMenu(props: { menu: EnhancedMenu }) {
  let { menu } = props;
  let items = menu.items as unknown as SingleMenuItem[];
  if (!items) return null;
  return (
    <nav className="flex items-stretch h-full">
      {items.map((item, id) => {
        let { title, ...rest } = item;
        let level = getMaxDepth(item);
        let isResourceType =
          item.items.length &&
          item.items.every((item) => item?.resource !== null);
        let Comp: React.FC<SingleMenuItem> = isResourceType
          ? ImageMenu
          : level > 2
            ? MultiMenu
            : level === 2
              ? SingleMenu
              : ItemHeader;
        return <Comp key={id} title={title} {...rest} />;
      })}
    </nav>
  );
}

function ItemHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="h-full flex items-center px-3 cursor-pointer relative z-30">
      <button className="py-2 group-hover:border-b hover:border-b">
        <Link to={to}>
          <span className="uppercase">{title}</span>
        </Link>
      </button>
    </div>
  );
}

function MultiMenu(props: SingleMenuItem) {
  let { title, items, to } = props;

  let renderList = (item: SingleMenuItem, idx: number) => (
    <div
      className="flex-1 fly-in"
      key={idx}
      style={{ "--item-index": idx } as { [key: string]: any }}
    >
      <h5 className="mb-4 uppercase font-medium">
        <Link to={item.to} prefetch="intent" className="animate-hover">
          {item.title}
        </Link>
      </h5>
      <ul className="space-y-1.5">
        {item.items.map((subItem, ind) => (
          <li key={ind} className="leading-6">
            <Link
              key={ind}
              to={subItem.to}
              prefetch="intent"
              className="animate-hover"
            >
              {subItem.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  let renderImageItem = (item: SingleMenuItem, idx: number) => (
    <div
      className="flex-1 w-full aspect-[4/5] relative group/item overflow-hidden fly-in"
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
      <div className="absolute w-full inset-0 text-center text-white font-medium pointer-events-none p-2 bg-black/15 group-hover/item:bg-black/30 flex items-center justify-center">
        {item.title}
      </div>
    </div>
  );
  return (
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div className={clsx("w-screen top-full left-0", dropdownContentClass)}>
        <div className="container mx-auto py-8">
          <div className="flex gap-4 w-full">
            {items.map((item, id) =>
              item.resource && item.items.length === 0
                ? renderImageItem(item, id)
                : renderList(item, id),
            )}
          </div>
          <div className="flex gap-6"></div>
        </div>
      </div>
    </div>
  );
}

function SingleMenu(props: SingleMenuItem) {
  let { title, items, to } = props;
  return (
    <div className="group relative">
      <ItemHeader title={title} to={to} />
      <div
        className={clsx(
          "top-full -left-3 group-hover:h-auto",
          dropdownContentClass,
        )}
      >
        <div className="p-6 min-w-48">
          <div>
            <h5 className="mb-4 uppercase font-medium">
              <Link to={to} prefetch="intent" className="animate-hover">
                {title}
              </Link>
            </h5>
            <ul className="space-y-1.5">
              {items.map((subItem, ind) => (
                <li key={ind} className="leading-6">
                  <Link
                    to={subItem.to}
                    prefetch="intent"
                    className="animate-hover"
                  >
                    {subItem.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageMenu({ title, items, to }: SingleMenuItem) {
  return (
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div className={clsx("w-screen top-full left-0", dropdownContentClass)}>
        <div className="py-8">
          <div className="flex gap-6 w-fit container mx-auto">
            {items.map((item, id) => (
              <Link
                to={item.to}
                prefetch="intent"
                key={id}
                className="flex-1 fly-in"
                style={{ "--item-index": id } as { [key: string]: any }}
              >
                <div className="aspect-square relative group/item overflow-hidden">
                  <Image
                    data={item?.resource?.image}
                    className="w-full h-full object-contain group-hover/item:scale-110 transition-transform duration-300"
                    sizes="auto"
                  />
                  <div className="absolute w-full inset-0 text-center text-white font-medium pointer-events-none p-2 bg-black/15 group-hover/item:bg-black/30 flex items-center justify-center">
                    {item.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
