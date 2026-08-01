/* ──────────────────────────────────────────────
 *  App shell — routing, auth, sidebar
 *
 *  Uses hash-based routing (zero dependencies).
 *  Routes:
 *    #/login   → Login page
 *    #/        → Dashboard (home)
 *    #/users   → User management (admin only)
 *    #/contacts, #/crm, #/sales, #/projects, #/reports → placeholders
 * ────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from "react";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireRole } from "./auth/RequireRole";

import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { StatusBadge } from "./components/StatusBadge";
import { LoginPage } from "./features/auth/LoginPage";
import { UserManagementPage } from "./features/users/UserManagementPage";
import { getHealth } from "./lib/api";

/* ── Hash router ── */

function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash || "#/");

  useEffect(() => {
    const handler = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return hash.replace(/^#\/?/, "/").replace(/\/$/, "") || "/";
}

function navigate(path: string) {
  window.location.hash = `#${path}`;
}

/* ── Navigation config ── */

type NavItem = {
  label: string;
  symbol: string;
  path: string;
  /** Only show for these roles */
  roles?: ("admin" | "manager" | "member")[];
  placeholder?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", symbol: "⌂", path: "/" },
  { label: "Contacts", symbol: "◎", path: "/contacts", placeholder: true },
  { label: "CRM", symbol: "◇", path: "/crm", placeholder: true },
  { label: "Sales", symbol: "▤", path: "/sales", placeholder: true },
  { label: "Projects", symbol: "▦", path: "/projects", placeholder: true },
  { label: "Reports", symbol: "↗", path: "/reports", placeholder: true },
  { label: "Users", symbol: "⚙", path: "/users", roles: ["admin"] },
];

/* ── Dashboard page (existing Week 1 content) ── */

const foundations = [
  {
    title: "Modular core",
    description: "Seven bounded modules with explicit ownership and dependency rules.",
    tag: "Architecture",
  },
  {
    title: "Shared language",
    description: "Business specifications and an ERD align all six contributors.",
    tag: "Product",
  },
  {
    title: "Quality gate",
    description: "Every pull request runs backend, frontend, type and build checks.",
    tag: "Delivery",
  },
];

function DashboardPage() {
  const [health, setHealth] = useState<"checking" | "ready" | "offline">("checking");

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then(() => setHealth("ready"))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHealth("offline");
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Foundation / Week 2</p>
          <h1>Build the system before the features.</h1>
        </div>
        <StatusBadge state={health} />
      </header>

      <section className="hero" aria-labelledby="foundation-heading">
        <div>
          <span className="pill">Auth & shared components ready</span>
          <h2 id="foundation-heading">One foundation. Six builders. A focused ERP.</h2>
          <p>
            The project is ready for vertical feature work: contacts, CRM, sales, projects, and
            reporting all share the same contracts and quality bar.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#/contacts">
              View foundation
            </a>
            <a className="button button--quiet" href="https://github.com" target="_blank">
              Repository ↗
            </a>
          </div>
        </div>
        <div className="flow-card" aria-label="Core business flow">
          <p className="flow-card__label">Core business flow</p>
          {["Contact", "Opportunity", "Quotation", "Project", "Task"].map((item, index) => (
            <div className="flow-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
              {index < 4 && <i aria-hidden="true">↓</i>}
            </div>
          ))}
        </div>
      </section>

      <section id="roadmap" className="section">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Ready to extend</p>
            <h2>Week 1 foundation</h2>
          </div>
          <span className="counter">03 / 03</span>
        </div>
        <div className="card-grid">
          {foundations.map((item, index) => (
            <article className="foundation-card" key={item.title}>
              <div className="foundation-card__topline">
                <span className="card-number">0{index + 1}</span>
                <span className="tag">{item.tag}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="page-footer">
        <span>Mirai Mini ERP · v0.1.0</span>
        <span>Designed for learning, built for integration.</span>
      </footer>
    </>
  );
}

/* ── Placeholder page for modules not yet built ── */

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__icon">◇</div>
      <h1>{name}</h1>
      <p>This module is under development. Check back soon.</p>
    </div>
  );
}

/* ── Main shell with sidebar ── */

function AppShell() {
  const route = useHashRoute();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && route !== "/login") {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, route]);

  // Redirect away from login if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && route === "/login") {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, route]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout]);

  // Show login page without shell
  if (route === "/login") {
    if (isLoading) {
      return (
        <div style={{ padding: "3rem", maxWidth: "40rem", margin: "0 auto" }}>
          <LoadingSkeleton lines={4} />
        </div>
      );
    }
    return <LoginPage />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#/" aria-label="Mirai home">
            <span className="brand__mark">M</span>
            <span>
              <strong>Mirai</strong>
              <small>Mini ERP</small>
            </span>
          </a>
        </aside>
        <main className="main-content">
          <LoadingSkeleton lines={8} />
        </main>
      </div>
    );
  }

  // Not authenticated – will redirect
  if (!isAuthenticated) return null;

  // Filter nav items by role
  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  // Get user initials
  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "??";

  // Render page
  const renderPage = () => {
    switch (route) {
      case "/":
        return <DashboardPage />;
      case "/users":
        return (
          <RequireRole roles={["admin"]}>
            <UserManagementPage />
          </RequireRole>
        );
      case "/contacts":
        return <PlaceholderPage name="Contacts" />;
      case "/crm":
        return <PlaceholderPage name="CRM" />;
      case "/sales":
        return <PlaceholderPage name="Sales" />;
      case "/projects":
        return <PlaceholderPage name="Projects" />;
      case "/reports":
        return <PlaceholderPage name="Reports" />;
      default:
        return <PlaceholderPage name="Page not found" />;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#/" aria-label="Mirai home">
          <span className="brand__mark">M</span>
          <span>
            <strong>Mirai</strong>
            <small>Mini ERP</small>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          <ul className="nav-list">
            {visibleNav.map((item) => (
              <li key={item.path}>
                <a
                  className={route === item.path ? "active" : ""}
                  href={`#${item.path}`}
                >
                  <span aria-hidden="true">{item.symbol}</span>
                  {item.label}
                  {item.placeholder && <small>Soon</small>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user-info">
            <div className="avatar" aria-hidden="true">
              {initials}
            </div>
            <span>
              <strong>
                {user?.first_name} {user?.last_name}
              </strong>
              <small>{user?.email}</small>
              <small className="sidebar__role">{user?.role}</small>
            </span>
          </div>
          <button
            className="sidebar__logout"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

/* ── Root component ── */

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
