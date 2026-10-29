/**
 * Universal safe fetch and JSON response parser.
 * Protects against HTML error pages (404, 502, 503, "The page cannot be found...")
 * that cause "SyntaxError: Unexpected token 'T', 'The page c'... is not valid JSON".
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  defaultErrorMessage = "Ocorreu uma falha na comunicação com o servidor."
): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.message || defaultErrorMessage);
      }
      return data as T;
    } catch (err: any) {
      if (err.message && !err.message.includes("is not valid JSON")) {
        throw err;
      }
    }
  }

  // Response was not JSON (e.g. HTML 404, 502, 503 or plain text)
  const text = await response.text();
  if (!response.ok) {
    if (
      text.toLowerCase().includes("the page") ||
      text.includes("<!DOCTYPE") ||
      text.includes("<html")
    ) {
      throw new Error(
        `O servidor está temporariamente indisponível (HTTP ${response.status}). Por favor, tente novamente.`
      );
    }
    throw new Error(text.slice(0, 150) || defaultErrorMessage);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(defaultErrorMessage);
  }
}

/**
 * Non-throwing safe JSON parser for optional/background queries (returns fallback on any error)
 */
export async function safeFetchJsonQuiet<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallback: T = {} as T
): Promise<T> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return fallback;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return fallback;
    return await res.json().catch(() => fallback);
  } catch {
    return fallback;
  }
}
