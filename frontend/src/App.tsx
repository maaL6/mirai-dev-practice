import { useEffect, useState } from "react";

import { StatusBadge } from "./components/StatusBadge";
import { getHealth } from "./lib/api";

const modules = [
  { label: "Overview", symbol: "⌂", active: true },
  { label: "Contacts", symbol: "◎" },
  { label: "CRM", symbol: "◇" },
  { label: "Sales", symbol: "▤" },
  { label: "Projects", symbol: "▦" },
  { label: "Reports", symbol: "↗" },
];

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

function App() {
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
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Mirai home">
          <span className="brand__mark">M</span>
          <span>
            <strong>Mirai</strong>
            <small>Mini ERP</small>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          <ul className="nav-list">
            {modules.map((module) => (
              <li key={module.label}>
                <a className={module.active ? "active" : ""} href={`#${module.label.toLowerCase()}`}>
                  <span aria-hidden="true">{module.symbol}</span>
                  {module.label}
                  {!module.active && <small>Soon</small>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="avatar" aria-hidden="true">
            MT
          </div>
          <span>
            <strong>Mirai Team</strong>
            <small>6 contributors</small>
          </span>
        </div>
      </aside>

      <main id="top" className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Foundation / Week 1</p>
            <h1>Build the system before the features.</h1>
          </div>
          <StatusBadge state={health} />
        </header>

        <section className="hero" aria-labelledby="foundation-heading">
          <div>
            <span className="pill">Initialization complete</span>
            <h2 id="foundation-heading">One foundation. Six builders. A focused ERP.</h2>
            <p>
              The project is ready for vertical feature work: contacts, CRM, sales, projects, and
              reporting all share the same contracts and quality bar.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#roadmap">
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
      </main>
    </div>
  );
}

export default App;
