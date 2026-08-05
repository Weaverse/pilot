interface CartNoteUpdater<TOptions, TResult> {
  updateNote(note: string, options?: TOptions): Promise<TResult>;
}

interface CartNoteResult {
  cart?: {
    id?: unknown;
    note?: unknown;
  };
}

interface CartNoteUserError {
  field: string[];
  message: string;
}

export interface InvalidCartNoteResult {
  cart: undefined;
  errors: undefined;
  userErrors: CartNoteUserError[];
}

export function isCartNoteInput(note: unknown): note is string {
  return typeof note === "string";
}

export function getInvalidCartNoteResult(): InvalidCartNoteResult {
  return {
    cart: undefined,
    errors: undefined,
    userErrors: [
      {
        field: ["cartNote"],
        message: "Cart note must be a string.",
      },
    ],
  };
}

export function normalizeCartNote(note: string): string {
  return note.trim() ? note : "";
}

export function updateCartNote<TOptions, TResult>(
  cart: CartNoteUpdater<TOptions, TResult>,
  note: string,
  options?: TOptions,
): Promise<TResult>;
export function updateCartNote<TOptions, TResult>(
  cart: CartNoteUpdater<TOptions, TResult>,
  note: unknown,
  options?: TOptions,
): Promise<TResult | InvalidCartNoteResult>;
export async function updateCartNote<TOptions, TResult>(
  cart: CartNoteUpdater<TOptions, TResult>,
  note: unknown,
  options?: TOptions,
): Promise<TResult | InvalidCartNoteResult> {
  if (!isCartNoteInput(note)) {
    return getInvalidCartNoteResult();
  }
  return cart.updateNote(normalizeCartNote(note), options);
}

export function hasCartResponseErrors(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  let { errors, userErrors } = data as {
    errors?: unknown;
    userErrors?: unknown;
  };
  return hasErrors(errors) || hasErrors(userErrors);
}

export function getSuccessfulCartNote(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || hasCartResponseErrors(data)) {
    return;
  }

  let { cart } = data as CartNoteResult;
  if (!cart || typeof cart.id !== "string" || !cart.id) {
    return;
  }
  if (cart.note === null) {
    return "";
  }
  if (typeof cart.note !== "string") {
    return;
  }
  return cart.note;
}

function hasErrors(errors: unknown): boolean {
  if (Array.isArray(errors)) {
    return errors.length > 0;
  }
  return Boolean(errors);
}
