function errorMessage(err, fallback) {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const o = err;
    if (typeof o.message === "string" && o.message) {
      const detail = typeof o.details === "string" && o.details ? ` (${o.details})` : "";
      return `${o.message}${detail}`;
    }
  }
  return fallback;
}
export {
  errorMessage as e
};
