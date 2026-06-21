function trim(value: string | undefined): string | undefined {
  return value?.trim();
}

/** When false (default), /api-docs and /api/openapi.json return 404. */
export function isApiDocsEnabled(): boolean {
  const value = trim(process.env.ENABLE_API_DOCS);
  if (!value) {
    return false;
  }
  return value === "true" || value === "1";
}
