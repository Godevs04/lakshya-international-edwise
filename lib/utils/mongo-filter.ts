export function mergeMongoFilter(
  base: Record<string, unknown>,
  ...andClauses: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> {
  const extras = andClauses.filter(
    (clause): clause is Record<string, unknown> => Boolean(clause)
  );
  if (extras.length === 0) return { ...base };

  const parts: Record<string, unknown>[] = [];
  const flat = { ...base };

  if (Array.isArray(flat.$and)) {
    parts.push(...(flat.$and as Record<string, unknown>[]));
    delete flat.$and;
  }

  if (Object.keys(flat).length > 0) {
    parts.push(flat);
  }

  parts.push(...extras);

  return parts.length === 1 ? parts[0]! : { $and: parts };
}
