// frontend/lib/api.js

// --- Config ---
const DEFAULT_LOCAL_API = "http://127.0.0.1:8081"; // dev backend default
const DEFAULT_TIMEOUT_MS = 25000;

let _apiBase = null;

/**
 * Try to infer a sensible backend base when env isn't set.
 * - localhost/127.0.0.1 ➜ DEFAULT_LOCAL_API
 * - app.<domain> ➜ https://api.<domain>
 * - otherwise same-origin (empty string; your layout fetch shim can rewrite)
 */
function _resolveBaseFromWindow() {
  if (typeof window === "undefined") return ""; // SSR: let the server-side request use same-origin

  const host = window.location.hostname || "";
  const proto = window.location.protocol || "https:";

  // Dev on localhost
  if (host === "localhost" || host === "127.0.0.1") {
    return DEFAULT_LOCAL_API;
  }

  // app.<apex> -> api.<apex>
  if (host.startsWith("app.")) {
    const parts = host.split(".");
    if (parts.length >= 3) {
      const apex = parts.slice(-2).join(".");
      return `${proto}//api.${apex}`;
    }
  }

  // Same-origin (empty string so fetch("/api/...") stays relative)
  return "";
}

/**
 * Resolve the backend base URL once.
 * Priority:
 * 1) NEXT_PUBLIC_API_BASE_URL (exact)
 * 2) Window inference (localhost ➜ 127.0.0.1:8081, app.* ➜ api.*)
 * 3) Same-origin ("")
 */
export function getApiBase() {
  if (_apiBase !== null) return _apiBase;

  const env = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  if (env) {
    _apiBase = env.replace(/\/+$/, "");
    return _apiBase;
  }

  _apiBase = _resolveBaseFromWindow().replace(/\/+$/, "");
  return _apiBase;
}

/** Optional manual override (useful for runtime debugging). */
export function setApiBase(nextBase) {
  _apiBase = (nextBase || "").replace(/\/+$/, "");
}

/** Join base + path safely. Accepts absolute URLs and returns them unchanged. */
export function buildUrl(path) {
  if (!path) return getApiBase();
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBase();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

/** AbortController timeout wrapper */
async function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await promise(ctrl.signal);
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/** Parse JSON or throw with a helpful message */
async function safeParseJson(resp) {
  const text = await resp.text();
  const ct = (resp.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Bad JSON from ${resp.url} (status ${resp.status}): ${text.slice(0, 300)}`);
    }
  }
  throw new Error(
    `Expected JSON from ${resp.url} (status ${resp.status}). Got: ${text.slice(0, 300)}`
  );
}

/** Normalize network errors into something actionable */
function wrapNetworkError(err, url) {
  // In browsers, a CORS/DNS/blocked request often throws a TypeError
  if (err?.name === "AbortError") {
    return new Error(`Request timed out fetching ${url}. Is the backend reachable?`);
  }
  if (err instanceof TypeError) {
    return new Error(
      `Network error while fetching ${url}. Check:\n` +
        `• NEXT_PUBLIC_API_BASE_URL (frontend) points to your backend\n` +
        `• Backend CORS FRONTEND_URL includes this origin\n` +
        `• If using Cloudflare, the tunnel is active`
    );
  }
  return err;
}

/** GET (credentials on for cookies). Pass { noCache: true } to bypass caches. */
export async function apiGet(path, init = {}) {
  const url = buildUrl(path);
  const noCache = init.noCache === true;
  const headers = new Headers(init.headers || {});
  if (noCache) {
    headers.set("cache-control", "no-cache");
    headers.set("pragma", "no-cache");
  }

  try {
    const resp = await withTimeout(
      (signal) =>
        fetch(url, {
          method: "GET",
          credentials: "include",
          signal,
          ...init,
          headers,
        }),
      init.timeoutMs || DEFAULT_TIMEOUT_MS
    );

    if (!resp.ok) {
      try {
        const j = await safeParseJson(resp);
        throw new Error(j?.error || `GET ${url} failed (${resp.status})`);
      } catch (e) {
        throw e;
      }
    }
    return safeParseJson(resp);
  } catch (e) {
    throw wrapNetworkError(e, url);
  }
}

/** POST (multipart or JSON) — credentials included by default */
export async function apiPost(path, body, init = {}) {
  const url = buildUrl(path);
  const opts = { method: "POST", credentials: "include", ...init };

  if (body instanceof FormData) {
    opts.body = body;
  } else if (body && typeof body === "object") {
    opts.headers = { "content-type": "application/json", ...(init.headers || {}) };
    opts.body = JSON.stringify(body);
  } else {
    opts.body = body;
  }

  try {
    const resp = await withTimeout(
      (signal) => fetch(url, { ...opts, signal }),
      init.timeoutMs || DEFAULT_TIMEOUT_MS
    );

    if (!resp.ok) {
      try {
        const j = await safeParseJson(resp);
        throw new Error(j?.error || `POST ${url} failed (${resp.status})`);
      } catch (e) {
        throw e;
      }
    }
    return safeParseJson(resp);
  } catch (e) {
    throw wrapNetworkError(e, url);
  }
}

/** Make an absolute URL for media/download paths or already-absolute URLs */
export function absoluteMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return buildUrl(p);
}

/* ---- Convenience helpers (optional) ---- */

/** Fetch styles with no-cache to ensure you always see all styles */
export async function fetchStyles() {
  const res = await apiGet("/api/styles", { noCache: true });
  // Defensive: normalize expected shape
  return Array.isArray(res?.styles) ? res.styles : [];
}

/** Quick health check */
export async function ping() {
  return apiGet("/api/ping", { noCache: true });
}
