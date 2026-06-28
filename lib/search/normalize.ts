// Shared text normalization for the search layer.
// Lower-case, strip diacritics & punctuation, collapse whitespace.

export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a normalized string into meaningful tokens (length ≥ 2). */
export function tokenize(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((t) => t.length >= 2);
}
