import { useItemInstance } from "@weaverse/hydrogen";
import { type RefObject, useEffect, useState } from "react";

export function useClosestWeaverseItem<T>(ref: RefObject<T>) {
  let [weaverseId, setWeaverseId] = useState<string>("");
  let weaverseItem = useItemInstance(weaverseId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: assuming `selector` does not change
  useEffect(() => {
    if (!weaverseItem && ref.current) {
      let closest = (ref.current as HTMLElement).closest("[data-wv-id]");
      if (closest) {
        setWeaverseId(closest.getAttribute("data-wv-id"));
      }
    }
  }, [ref]);

  return weaverseItem;
}
