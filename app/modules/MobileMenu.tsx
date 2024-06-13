import { Link } from "@remix-run/react";
import { Drawer, useDrawer } from "./Drawer";
import { IconCaret } from "./Icon";
import { Disclosure } from "@headlessui/react";
import { Image } from "@shopify/hydrogen";

interface Item {
  title: string;
  to: string;
}
interface SingleMenuItem {
  title: string;
  items: Item[];
}

interface MenuItemProps {
  title: string;
  items: SingleMenuItem[];
}

interface ImageItem {
  title: string;
  data: {
    altText: string;
    url: string;
    width: number;
    height: number;
  };
  to: string;
}

export function MobileMenu({ onClose }: { onClose: () => void }) {
  let items = [
    {
      title: "Best Sellers",
      items: [
        {
          title: "Black Friday",
          to: "/black-friday",
        },
        {
          title: "History Month",
          to: "/history-month",
        },
        {
          title: "Outlets",
          to: "/outlets",
        },
      ],
    },
    {
      title: "SHIRTS & TEES",
      items: [
        {
          title: "New Arrivals",
          to: "/new-arrivals",
        },
        {
          title: "Tops",
          to: "/tops",
        },
        {
          title: "Jackets",
          to: "/jackets",
        },
        {
          title: "Denims",
          to: "/denims",
        },
        {
          title: "Pants",
          to: "/pants",
        },
      ],
    },
    {
      title: "PANTS & JEANS",
      items: [
        {
          title: "New Arrivals",
          to: "/new-arrivals",
        },
        {
          title: "Scarfs",
          to: "/scarfs",
        },
        {
          title: "Hats",
          to: "/hats",
        },
        {
          title: "Jewelries",
          to: "/jewelries",
        },
      ],
    },
    {
      title: "Accessories",
      items: [
        {
          title: "Bags",
          to: "/bags",
        },
        {
          title: "Earrings",
          to: "/earrings",
        },
        {
          title: "Hats",
          to: "/hats",
        },
        {
          title: "Socks",
          to: "/socks",
        },
        {
          title: "Belts",
          to: "/belts",
        },
      ],
    },
  ];
  let imageMenuItems: ImageItem[] = [
    {
      title: "Women's Jackets",
      data: {
        altText: "Women",
        url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/woman.jpg?v=1717490382",
        width: 860,
        height: 1500,
      },
      to: "/collections/jackets",
    },
    {
      title: "Women's Jackets",
      data: {
        altText: "Women",
        url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/woman.jpg?v=1717490382",
        width: 860,
        height: 1500,
      },
      to: "/collections/jackets",
    },
    {
      title: "Women's Jackets",
      data: {
        altText: "Women",
        url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/woman.jpg?v=1717490382",
        width: 860,
        height: 1500,
      },
      to: "/collections/jackets",
    },
    {
      title: "Women's Jackets",
      data: {
        altText: "Women",
        url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/woman.jpg?v=1717490382",
        width: 860,
        height: 1500,
      },
      to: "/collections/jackets",
    }
  ]
  return (
    <nav className="grid px-4 py-2">
      <MenuItem title="Woman" items={items} />
      <MenuItem title="Men" items={items} />
      <ImageMenu title="Accesories" items={imageMenuItems} />
      <MenuItem title="Pilot" items={items} />
      {/* Top level menu items */}
      {/* {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "pb-1 border-b -mb-px" : "pb-1"
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))} */}
    </nav>
  );
}

function MenuItem(props: MenuItemProps) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let { title, items } = props;
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
    >
      <div className="grid px-4 py-2 overflow-auto">
        {items.map((item, id) => (
          <div key={id}>
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="text-left w-full">
                    <h5 className="flex justify-between py-3 w-full uppercase font-medium">
                      {item.title}
                      <span className="md:hidden">
                        <IconCaret direction={open ? "down" : "right"} />
                      </span>
                    </h5>
                  </Disclosure.Button>
                  {item?.items?.length > 0 ? (
                    <div
                      className={`${
                        open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                    >
                      <Disclosure.Panel static>
                        <ul className="space-y-3 pb-3 pt-2">
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
                      </Disclosure.Panel>
                    </div>
                  ) : null}
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Drawer>
  );
  return (
    <div className="">
      <div
        className="flex justify-between items-center py-3"
        role="button"
        onClick={openMenu}
      >
        <span className="uppercase font-medium">{title}</span>{" "}
        <IconCaret direction="right" />
      </div>
      {content}
    </div>
  );
}

function ImageMenu({ title, items }: { title: string; items: ImageItem[] }) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
    >
      <div className="grid px-4 py-5 gap-3 grid-cols-2">
        {items.map((item, id) => (
          <Link to={item.to} prefetch="intent" key={id}>
            <div className="w-full aspect-square relative">
              <Image data={item.data} className="w-full h-full object-cover" />
              <div className="absolute w-full top-1/2 left-0 text-center -translate-y-1/2 text-white font-medium pointer-events-none">
                {item.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Drawer>
  );
  return (
    <div className="">
      <div
        className="flex justify-between items-center py-3"
        role="button"
        onClick={openMenu}
      >
        <span className="uppercase font-medium">{title}</span>{" "}
        <IconCaret direction="right" />
      </div>
      {content}
    </div>
  );
}
