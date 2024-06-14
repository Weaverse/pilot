interface Item {
  title: string;
  to: string;
}
interface SingleMenuItem {
  title: string;
  items: Item[];
  to: string;
}

export interface ImageItem {
  title: string;
  data: {
    altText: string;
    url: string;
    width: number;
    height: number;
  };
  to: string;
}

export interface MultiMenuProps {
  title: string;
  items: SingleMenuItem[];
  imageItems: ImageItem[];
  to: string;
}

export interface SingleMenuProps {
  title: string;
  items: Item[];
  to: string;
}
export interface ImageMenuProps {
  title: string;
  imageItems: ImageItem[];
  to: string;
}

let items = [
  {
    title: "Best Sellers",
    to: "/best-sellers",
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
    to: "/shirts-tees",
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
    to: "/pants-jeans",
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
    to: "/accessories",
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

let popupItems: Item[] = [
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
];

interface NavItem {
  title: string;
  type: "multi" | "image" | "single";
  items?: SingleMenuItem[] | Item[];
  imageItems?: ImageItem[];
  to: string;
}

export let Nav_Items: NavItem[] = [
  {
    title: "Woman",
    type: "multi",
    items: items,
    imageItems: imageItems,
    to: "/women",
  },
  {
    title: "Men",
    type: "multi",
    items: items,
    imageItems: [],
    to: "/men",
  },
  {
    title: "Accesories",
    type: "image",
    imageItems: imageMenuItems,
    to: "/accessories",
  },
  {
    title: "Pilot",
    type: "single",
    items: popupItems,
    to: "/pilot",
  },
];
