import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    // Reset hash
    window.location.hash = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.location.hash = "";
  });

  it("shows login page when not authenticated", async () => {
    // Mock getMe to return 401 (not logged in)
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

      if (url.includes("/auth/me/")) {
        return new Response(
          JSON.stringify({ code: "not_authenticated", detail: "Authentication required." }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ status: "ok", service: "mirai-api", database: "ok", version: "0.1.0" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it("shows dashboard when authenticated", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

      if (url.includes("/auth/me/")) {
        return new Response(
          JSON.stringify({
            id: "6b7b75e4-5798-48b7-bddb-cf097ee93e65",
            email: "admin@example.test",
            username: "admin",
            first_name: "System",
            last_name: "Admin",
            role: "admin",
            is_active: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.includes("/health/")) {
        return new Response(
          JSON.stringify({ status: "ok", service: "mirai-api", database: "ok", version: "0.1.0" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /one foundation/i })).toBeInTheDocument();
    });

    // Sidebar shows user info
    expect(screen.getByText("System Admin")).toBeInTheDocument();
    expect(screen.getByText("admin@example.test")).toBeInTheDocument();
  });
});
