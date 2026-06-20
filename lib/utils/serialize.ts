type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isObjectId(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    obj._bsontype === "ObjectId" ||
    (typeof obj.toHexString === "function" && "buffer" in obj)
  );
}

export function serializeForClient(input: unknown): JsonValue {
  if (input === null || input === undefined) {
    return null;
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  if (Array.isArray(input)) {
    return input.map((item) => serializeForClient(item)) as JsonValue;
  }

  if (typeof input === "object") {
    if (isObjectId(input)) {
      return String(input);
    }

    const record = input as Record<string, unknown>;
    const output: Record<string, JsonValue> = {};

    for (const [key, value] of Object.entries(record)) {
      if (key === "__v") continue;

      if (key === "_id" && value !== null && value !== undefined) {
        output.id = serializeForClient(value) as string;
        continue;
      }

      output[key] = serializeForClient(value);
    }

    return output;
  }

  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return input;
  }

  return String(input);
}

export function serializeRowsForClient(
  rows: unknown[]
): Record<string, JsonValue>[] {
  return rows.map((row) => serializeForClient(row) as Record<string, JsonValue>);
}
