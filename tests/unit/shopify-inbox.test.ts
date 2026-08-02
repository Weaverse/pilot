import { expect, test } from "@playwright/test";
import { openShopifyInbox } from "../../app/components/shopify-inbox";

const originalDocument = globalThis.document;

test.afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
});

test("opens Shopify Inbox through the public shopify-chat API", () => {
  let showCalls = 0;
  const chat = {
    open: false,
    show() {
      showCalls += 1;
      this.open = true;
    },
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementById: () => null,
      querySelector: (selector: string) =>
        selector === "shopify-chat" ? chat : null,
    },
  });

  expect(openShopifyInbox()).toBe(true);
  expect(showCalls).toBe(1);
  expect(chat.open).toBe(true);
});
