import { useItemInstance } from "@weaverse/hydrogen";
import { useEffect, useState } from "react";

export function useClosestWeaverseItem(selector: string) {
  let [weaverseId, setWeaverseId] = useState<string>("");
  let weaverseItem = useItemInstance(weaverseId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: assuming `selector` does not change
  useEffect(() => {
    if (!weaverseItem) {
      let target = document.querySelector(selector);
      if (target) {
        let closest = target.closest("[data-wv-id]");
        if (closest) {
          setWeaverseId(closest.getAttribute("data-wv-id"));
        }
      }
    }
  }, []);

  return weaverseItem;
}
