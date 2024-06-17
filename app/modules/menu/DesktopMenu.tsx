import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import {
  Nav_Items,
  type ImageMenuProps,
  type MultiMenuProps,
  type SingleMenuProps,
} from "./defines";

const MenuByType = {
  multi: MultiMenu,
  image: ImageMenu,
  single: SingleMenu,
};

export function DesktopMenu() {
  return (
    <nav className="flex items-stretch h-full">
      {Nav_Items.map((item, id) => {
        let { title, type, ...rest } = item;
        let Comp = MenuByType[type];
        return <Comp key={id} title={title} {...rest} />;
      })}
    </nav>
  );
}

function ItemHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="h-full flex items-center px-3 cursor-pointer">
      <button className=" py-2 group-hover:border-b">
        <Link to={to}>
          <span className="uppercase">{title}</span>
        </Link>
      </button>
    </div>
  );
}

function MultiMenu(props: MultiMenuProps) {
  let { title, items, to, imageItems } = props;
  return (
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div className="w-screen top-full left-0 h-0 overflow-hidden group-hover:h-96 group-hover:border-t bg-white shadow-md transition-all duration-75 absolute">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-6 gap-4 w-full">
            {items.map((item, id) => (
              <div key={id}>
                <h5 className="mb-4 uppercase font-medium">
                  <Link
                    to={item.to}
                    prefetch="intent"
                    className="animate-hover"
                  >
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
            ))}
            {imageItems.map((item, id) => (
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
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div className="top-full left-1/2 translate-x-1/2 h-0 bg-white shadow-md overflow-hidden group-hover:h-40 group-hover:border-t transition-all duration-75 absolute">
        <div className="p-8">
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

function ImageMenu({ title, imageItems, to }: ImageMenuProps) {
  return (
    <div className="group">
      <ItemHeader title={title} to={to} />
      <div className="w-screen top-full left-0 h-0 overflow-hidden group-hover:h-96 group-hover:border-t bg-white shadow-md transition-all duration-75 absolute">
        <div className="py-8">
          <div className="grid grid-cols-4 gap-6 w-fit container mx-auto">
            {imageItems.map((item, id) => (
              <Link to={item.to} prefetch="intent" key={id}>
                <div className="h-80 aspect-square relative">
                  <Image
                    data={item.data}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute w-full top-1/2 left-0 text-center -translate-y-1/2 text-white font-medium pointer-events-none">
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
