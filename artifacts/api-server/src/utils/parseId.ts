export function parseId(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

export function requireParsedId(value: string | undefined): number {
  const id = parseId(value);
  if (id === null) throw new Error("Invalid ID format");
  return id;
}
