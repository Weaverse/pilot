export interface SingleMenuItem {
  id: string;
  title: string;
  items: SingleMenuItem[];
  to: string;
  resource?: {
    image?: {
      altText: string;
      height: number;
      id: string;
      url: string;
      width: number;
    };
  };
}
