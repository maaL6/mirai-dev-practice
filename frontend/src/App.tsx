import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/CustomerList';
import { CustomerDetails } from './pages/CustomerDetails';

const queryClient = new QueryClient();

const modules = [
  { label: 'Overview', symbol: '⌂', path: '/' },
  { label: 'Contacts', symbol: '◎', path: '/contacts' },
  { label: 'CRM', symbol: '◇', path: '/crm' },
  { label: 'Sales', symbol: '▤', path: '/sales' },
  { label: 'Projects', symbol: '▦', path: '/projects' },
  { label: 'Reports', symbol: '↗', path: '/reports' },
];

function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="Mirai home">
          <span className="brand__mark">M</span>
          <span>
            <strong>Mirai</strong>
            <small>Mini ERP</small>
          </span>
        </Link>

        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          <ul className="nav-list">
            {modules.map((module) => {
              const active = location.pathname === module.path;
              return (
                <li key={module.label}>
                  <Link className={active ? 'active' : ''} to={module.path}>
                    <span aria-hidden="true">{module.symbol}</span>
                    {module.label}
                    {!['/', '/contacts'].includes(module.path) && <small>Soon</small>}
                  </Link>
                </li>
              );
            })}
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

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contacts" element={<CustomerList />} />
        <Route path="/contacts/:id" element={<CustomerDetails />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
