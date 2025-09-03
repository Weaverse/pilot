import { createContext, useContext, useState } from "react";

interface ProductQuantityContextType {
  quantity: number;
  setQuantity: (quantity: number) => void;
}

const ProductQuantityContext = createContext<ProductQuantityContextType | undefined>(undefined);

export function ProductQuantityProvider({ children, initialQuantity = 1 }: { children: React.ReactNode; initialQuantity?: number }) {
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <ProductQuantityContext.Provider value={{ quantity, setQuantity }}>
      {children}
    </ProductQuantityContext.Provider>
  );
}

export function useProductQuantity() {
  const context = useContext(ProductQuantityContext);
  if (!context) {
    return { quantity: 1, setQuantity: () => {} };
  }
  return context;
}