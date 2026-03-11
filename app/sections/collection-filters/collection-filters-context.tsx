import { createContext, use, useEffect, useState } from "react";

interface CollectionFiltersContextValue {
  filtersPosition: "sidebar" | "drawer";
  enableFilter: boolean;
  gridSizeDesktop: number;
  gridSizeMobile: number;
  setGridSizeDesktop: (size: number) => void;
  setGridSizeMobile: (size: number) => void;
}

const CollectionFiltersContext =
  createContext<CollectionFiltersContextValue | null>(null);

export function CollectionFiltersProvider({
  filtersPosition,
  enableFilter,
  productsPerRowDesktop,
  productsPerRowMobile,
  children,
}: {
  filtersPosition: "sidebar" | "drawer";
  enableFilter: boolean;
  productsPerRowDesktop: number;
  productsPerRowMobile: number;
  children: React.ReactNode;
}) {
  const [gridSizeDesktop, setGridSizeDesktop] = useState(
    Number(productsPerRowDesktop) || 3,
  );
  const [gridSizeMobile, setGridSizeMobile] = useState(
    Number(productsPerRowMobile) || 1,
  );

  useEffect(() => {
    setGridSizeDesktop(Number(productsPerRowDesktop) || 3);
    setGridSizeMobile(Number(productsPerRowMobile) || 1);
  }, [productsPerRowDesktop, productsPerRowMobile]);

  return (
    <CollectionFiltersContext
      value={{
        filtersPosition,
        enableFilter,
        gridSizeDesktop,
        gridSizeMobile,
        setGridSizeDesktop,
        setGridSizeMobile,
      }}
    >
      {children}
    </CollectionFiltersContext>
  );
}

export function useCollectionFiltersContext() {
  const context = use(CollectionFiltersContext);
  if (!context) {
    throw new Error(
      "useCollectionFiltersContext must be used within a CollectionFiltersProvider",
    );
  }
  return context;
}
