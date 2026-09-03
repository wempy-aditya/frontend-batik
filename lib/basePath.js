// Base path helper — reads NEXT_PUBLIC_BASE_PATH env (e.g. "/v1" or "")
// When empty, all functions become no-ops so the app works without a base path.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export function withBasePath(path = "") {
  if (!path || !path.startsWith("/")) {
    return path;
  }
  return basePath ? `${basePath}${path}` : path;
}

export function stripBasePath(path = "") {
  if (!path || !path.startsWith("/")) {
    return path;
  }
  if (!basePath || path === basePath) {
    return path === basePath ? "/" : path;
  }
  return path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
}