export const INVALID_CART_NOTE_MESSAGE = "Cart note must be a string.";

export function isCartNoteInput(note: unknown): note is string {
  return typeof note === "string";
}

/** An all-whitespace note clears the note instead of saving blank text. */
export function normalizeCartNote(note: string): string {
  return note.trim() ? note : "";
}
