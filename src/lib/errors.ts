/**
 * Extract a human-readable message from anything thrown.
 *
 * Supabase's PostgrestError is a plain object (not an Error subclass), so
 * `err instanceof Error` returns false and we'd otherwise drop the actual
 * DB/RLS message on the floor. This helper handles both shapes.
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const o = err as { message?: unknown; details?: unknown; hint?: unknown };
    if (typeof o.message === "string" && o.message) {
      const detail = typeof o.details === "string" && o.details ? ` (${o.details})` : "";
      return `${o.message}${detail}`;
    }
  }
  return fallback;
}
