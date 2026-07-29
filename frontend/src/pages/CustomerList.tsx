import { useQuery } from '@tanstack/react-query';

interface Customer {
  id: string;
  name: string;
  kind: 'company' | 'individual';
  email: string;
  phone: string;
  owner: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function CustomerList() {
  const { data, isLoading, isError, error } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers/');
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Customers</p>
            <h1>Loading...</h1>
          </div>
        </header>
        <section className="section">
          <div>Loading customer data...</div>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Customers</p>
            <h1>Error</h1>
          </div>
        </header>
        <section className="section">
          <div>An error occurred: {error instanceof Error ? error.message : 'Unknown error'}</div>
        </section>
      </main>
    );
  }

  if (!data || data.length === 0) {
    return (
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Customers</p>
            <h1>Customer List</h1>
          </div>
        </header>
        <section className="section">
          <div>No customers found.</div>
        </section>
      </main>
    );
  }

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <p className="eyebrow">Customers</p>
          <h1>Customer List</h1>
        </div>
      </header>
      <section className="section">
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>Kind</th>
              <th style={{ padding: '0.5rem' }}>Email</th>
              <th style={{ padding: '0.5rem' }}>Phone</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.5rem' }}>{customer.name}</td>
                <td style={{ padding: '0.5rem' }}>{customer.kind}</td>
                <td style={{ padding: '0.5rem' }}>{customer.email}</td>
                <td style={{ padding: '0.5rem' }}>{customer.phone}</td>
                <td style={{ padding: '0.5rem' }}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
