import { Link, useLoaderData } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import {
  type ImageMenuProps,
  type MultiMenuProps,
  type SingleMenuProps,
} from "./defines";
import clsx from "clsx";
import type { loader } from "~/root";

function getMaxDepth(item) {
  if (item.items?.length > 0) {
    return Math.max(...item.items.map(getMaxDepth)) + 1;
  }
  return 1;
}

const commonAnimatedClass =
  "absolute h-0 opacity-0 overflow-hidden bg-white shadow-md transition-all ease-out group-hover:opacity-100 group-hover:border-t duration-500 group-hover:duration-300 group-hover:z-50 ";

// function addPrefixForEachClass(prefix: string, className: string,) {
//   return className.split(" ").map((className) => `${prefix}${className}`).join(" ");
// }

// const commonAnimatedClass = clsx(
//   "absolute -translate-y-full overflow-hidden bg-white shadow-md transition-all ease-out duration-300",
//  addPrefixForEachClass("group-hover:", "opacity-100 border-t z-50 translate-y-0"),
// )

export function DesktopMenu() {
  const data = useLoaderData<typeof loader>();
  let menu = data?.layout?.headerMenu;
  let items = menu?.items;
  if (!items) return null;
  return (
    <nav className="flex items-stretch h-full">
      {items.map((item, id) => {
        let { title, type, ...rest } = item;
        let level = getMaxDepth(item);
        let isResourceType =
          item.items.length &&
          item.items.every((item) => item?.resource !== null);
        let Comp = isResourceType
          ? ImageMenu
          : level > 2
            ? MultiMenu
            : level === 2
              ? SingleMenu
              : ItemHeader;
        return <Comp key={id} title={title} {...rest} />;
      })}
      {/* 
      {Nav_Items.map((item, id) => {
        let { title, type, ...rest } = item;
        let Comp = MenuByType[type];
        return <Comp key={id} title={title} {...rest} />;
      })} */}
    </nav>
  );
}

function ItemHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="h-full flex items-center pl-6 cursor-pointer">
      <button className="py-2 group-hover:border-b hover:border-b">
        <Link to={to}>
          <span className="uppercase">{title}</span>
        </Link>
      </button>
    </div>
  );
}

function MultiMenu(props: MultiMenuProps) {
  let { title, items, to, imageItems } = props;

  let renderList = (item, id) => (
    <div key={id}>
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

  let renderImageItem = (item, id) => (
    <div
      className="w-full aspect-[4/5] relative group/item overflow-hidden"
      key={id}
    >
      <Link to={item.to} prefetch="intent">
        <Image
          sizes="auto"
          data={item.resource?.image}
          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
        />
      </Link>
      <div className="absolute w-full top-1/2 left-0 text-center -translate-y-1/2 text-white font-medium pointer-events-none p-2 bg-black/50 group-hover/item:bg-black/70">
        {item.title}
      </div>
    </div>
  );
  return (
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div
        className={clsx(
          "w-screen top-full left-0 group-hover:h-96",
          commonAnimatedClass,
        )}
      >
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-6 gap-4 w-full">
            {items.map((item, id) =>
              item.resource && item.items.length === 0
                ? renderImageItem(item, id)
                : renderList(item, id),
            )}
            {imageItems?.map((item, id) => (
              <div key={id} className="w-full aspect-[4/5] relative">
                <Link to={item.to} prefetch="intent">
                  <Image
                    sizes="auto"
                    data={item.data}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="absolute w-full top-1/2 left-0 text-center -translate-y-1/2 text-white font-medium pointer-events-none">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6"></div>
        </div>
      </div>
    </div>
  );
}

function SingleMenu(props: SingleMenuProps) {
  let { title, items, to } = props;
  return (
    <div className="group relative">
      <ItemHeader title={title} to={to} />
      <div
        className={clsx(
          "top-full left-0 group-hover:h-auto",
          commonAnimatedClass,
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

function ImageMenu({ title, items, to }: ImageMenuProps) {
  return (
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div
        className={clsx(
          "w-screen top-full left-0 group-hover:h-96",
          commonAnimatedClass,
        )}
      >
        <div className="py-8">
          <div className="grid grid-cols-4 gap-6 w-fit container mx-auto">
            {items.map((item, id) => (
              <Link to={item.to} prefetch="intent" key={id}>
                <div className="h-80 aspect-square relative group/item overflow-hidden">
                  <Image
                    data={item.resource.image}
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
