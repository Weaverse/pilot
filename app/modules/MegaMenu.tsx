import { Link } from "@remix-run/react";
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

export function MegaMenu() {
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
  return (
    <nav className="flex gap-8 items-center">
      <MenuItem title="Woman" items={items} />
      <MenuItem title="Men" items={items} />
      <MenuItem title="Accesories" items={items} />
      <PopupItem title="Pilot" />
    </nav>
  );
}

function MenuItem(props: MenuItemProps) {
  let { title, items } = props;
  return (
    <div className="group">
      <button className="relative flex items-center justify-center focus:ring-primary/5 py-2 group-hover:border-b">
        <span className="uppercase">{title}</span>
      </button>
      <div className="w-screen top-full left-0 h-0 overflow-hidden group-hover:h-72 group-hover:border-t bg-white shadow-md transition-all duration-75 absolute">
        <div className="container mx-auto py-8 flex gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 grow">
            {items.map((item, index) => (
              <div key={index}>
                <h5 className="mb-4 uppercase font-medium">{item.title}</h5>
                <ul className="space-y-1.5">
                  {item.items.map((subItem, ind) => (
                    <li className="leading-6" key={ind}>
                      <Link key={ind} to={subItem.to} prefetch="intent">
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex gap-6">
            <div className="h-60">
              <Image
                sizes={"auto"}
                data={{
                  altText: "Women",
                  url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/woman.jpg?v=1717490382",
                  width: 860,
                  height: 1500,
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-60">
              <Image
                sizes={"auto"}
                data={{
                  altText: "Women",
                  url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/woman.jpg?v=1717490382",
                  width: 860,
                  height: 1500,
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PopupItem({ title }: { title: string }) {
  let items = {
    title: "Pilot",
    items: [
      {
        title: "Journal",
        to: "/journal",
      },
      {
        title: "Shipping & returns",
        to: "/shipping-returns",
      },
      {
        title: "About us",
        to: "/about-us",
      },
    ],
  };
  return (
    <div className="group">
      <button className="relative flex items-center justify-center focus:ring-primary/5 py-2 group-hover:border-b">
        <span className="uppercase">{title}</span>
      </button>
      <div className="top-full left-1/2 translate-x-1/2 h-0 bg-white shadow-md overflow-hidden group-hover:h-40 group-hover:border-t transition-all duration-75 absolute">
        <div className="p-8">
          <div>
            <h5 className="mb-4 uppercase font-medium">Pilot</h5>
            <ul className="space-y-1.5">
              {items.items.map((subItem, ind) => (
                <li className="leading-6" key={ind}>
                  <Link key={ind} to={subItem.to} prefetch="intent">
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
