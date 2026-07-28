/** Convert lean mongoose docs (ObjectId buffers, Dates) into JSON-safe plain objects. */
export function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
