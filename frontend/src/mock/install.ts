/* ──────────────────────────────────────────────
 *  Mock API installer – monkey-patches fetch
 *
 *  Activate by setting VITE_USE_MOCK=true in .env
 *  or by running: VITE_USE_MOCK=true npm run dev
 * ────────────────────────────────────────────── */

import { routes } from "./handlers";

const DELAY_MIN = 150;
const DELAY_MAX = 400;

function randomDelay(): Promise<void> {
  const ms = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
  return new Promise((r) => setTimeout(r, ms));
}

export function installMockApi(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    const method = (init?.method ?? "GET").toUpperCase();

    for (const route of routes) {
      if (route.method !== method) continue;
      const match = url.match(route.pattern);
      if (!match) continue;

      // Parse body
      let body: unknown = undefined;
      if (init?.body) {
        try {
          body = JSON.parse(init.body as string);
        } catch {
          body = init.body;
        }
      }

      await randomDelay();

      // Check abort
      if (init?.signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
      }

      const response = await route.handler(match, body);
      return response;
    }

    // Fall through to real fetch for unmatched routes
    return originalFetch(input, init);
  };

  console.info(
    "%c[Mock API] %cInstalled – all auth/user endpoints are mocked",
    "color: #1f6b4f; font-weight: bold",
    "color: #5f6e64",
  );
}
