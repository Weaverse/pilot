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

interface MenuItemProps {
  title: string;
  items: SingleMenuItem[];
  imageItems: ImageItem[];
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
  let imageItems = [
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
    },
  ];
  return (
    <nav className="flex items-stretch h-full">
      <MenuItem title="Woman" items={items} imageItems={imageItems} />
      <MenuItem title="Men" items={items} imageItems={imageItems} />
      <ImageItem title="Accesories" items={imageMenuItems} />
      <PopupItem title="Pilot" />
    </nav>
  );
}

function ItemHeader({ title }: { title: string }) {
  return (
    <div className="h-full flex items-center px-3 cursor-pointer">
      <button className=" py-2 group-hover:border-b">
        <span className="uppercase">{title}</span>
      </button>
    </div>
  );
}

function MenuItem(props: MenuItemProps) {
  let { title, items, imageItems } = props;
  return (
    <div className="group">
      <ItemHeader title={title} />
      <div className="w-screen top-full left-0 h-0 overflow-hidden group-hover:h-96 group-hover:border-t bg-white shadow-md transition-all duration-75 absolute">
        <div className="container mx-auto py-8 flex gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 grow">
            {items.map((item, id) => (
              <div key={id}>
                <h5 className="mb-4 uppercase font-medium">{item.title}</h5>
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
          </div>
          <div className="flex gap-6">
            {imageItems.map((item, id) => (
              <div key={id} className="h-60 aspect-[2/3] relative">
                <Link to={item.to} prefetch="intent">
                  <Image
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
      <ItemHeader title={title} />
      <div className="top-full left-1/2 translate-x-1/2 h-0 bg-white shadow-md overflow-hidden group-hover:h-40 group-hover:border-t transition-all duration-75 absolute">
        <div className="p-8">
          <div>
            <h5 className="mb-4 uppercase font-medium">Pilot</h5>
            <ul className="space-y-1.5">
              {items.items.map((subItem, ind) => (
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

function ImageItem({ title, items }: { title: string; items: ImageItem[] }) {
  return (
    <div className="group">
      <ItemHeader title={title} />
      <div className="w-screen top-full left-0 h-0 overflow-hidden group-hover:h-96 group-hover:border-t bg-white shadow-md transition-all duration-75 absolute">
        <div className="py-8">
          <div className="grid grid-cols-4 gap-6 w-fit container mx-auto">
            {items.map((item, id) => (
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
