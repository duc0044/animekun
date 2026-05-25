export type JsonRecord = Record<string, unknown>;

export const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};

export const asString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);

export const asNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;

export const asStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(asString).filter(Boolean) : [];

