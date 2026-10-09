/** The one query shape the Neon store needs; Neon's driver and PGlite both have it. */
export type Database = {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
};
