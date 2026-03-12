import { createContext, use, useEffect, useState } from "react";

interface MainCollectionContextValue {
  filtersPosition: "sidebar" | "drawer";
  enableFilter: boolean;
  gridSizeDesktop: number;
  gridSizeMobile: number;
  setGridSizeDesktop: (size: number) => void;
  setGridSizeMobile: (size: number) => void;
}

const MainCollectionContext = createContext<MainCollectionContextValue | null>(
  null,
);

export function MainCollectionProvider({
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
    <MainCollectionContext
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
    </MainCollectionContext>
  );
}

export function useMainCollectionContext() {
  const context = use(MainCollectionContext);
  if (!context) {
    throw new Error(
      "useMainCollectionContext must be used within a MainCollectionProvider",
    );
  }
  return context;
}
