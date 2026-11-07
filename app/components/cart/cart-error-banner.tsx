import { useState } from "react";
import { Icon } from "~/components/icon";
import { cn } from "~/utils/cn";
import { useCart } from "./cart-store";

/**
 * Cart errors with no inline home: failed requests, cart-level errors, and
 * errors for lines that are no longer in the cart (a failed add's optimistic
 * line is rolled back, so its error lands here). Line errors for lines still
 * in the cart render next to that line instead.
 */
export function CartErrorBanner({ className }: { className?: string }) {
  const errors = useCart((state) => state.errors);
  const lines = useCart((state) => state.data.lines.nodes);
  const [dismissedAt, setDismissedAt] = useState(0);

  const lineIds = new Set(lines.map((line) => line.id));
  const orphaned = [...errors.lines]
    .filter(([lineId]) => !lineIds.has(lineId))
    .flatMap(([, group]) => group.userErrors);
  const messages = [
    ...new Set(
      [...errors.network, ...errors.cart.userErrors, ...orphaned].map(
        (error) => error.message,
      ),
    ),
  ];

  if (messages.length === 0 || errors.lastUpdatedAt <= dismissedAt) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start justify-between gap-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700",
        className,
      )}
    >
      <div className="grid gap-1">
        {messages.map((message) => (
          <span key={message}>{message}</span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setDismissedAt(errors.lastUpdatedAt)}
        aria-label="Dismiss error"
      >
        <Icon name="x" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
