interface Item {
  title: string;
  to: string;
}
interface SingleMenuItem {
  title: string;
  items: Item[];
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
}

export interface SingleMenuProps {
    title: string;
    items: Item[];
}

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
}

export let Nav_Items: NavItem[] = [
  {
    title: "Woman",
    type: "multi",
    items: items,
    imageItems: imageItems,
  },
  {
    title: "Men",
    type: "multi",
    items: items,
    imageItems: [],
  },
  {
    title: "Accesories",
    type: "image",
    imageItems: imageMenuItems,
  },
  {
    title: "Pilot",
    type: "single",
    items: popupItems,
  },
];
