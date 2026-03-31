import { NonceProvider } from "@shopify/hydrogen";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

if (window.location.hostname !== "webcache.googleusercontent.com") {
  startTransition(() => {
    const existingNonce =
      document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
