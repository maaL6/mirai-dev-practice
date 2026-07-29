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
        throw new Error(`HTTP Error: ${res.status}`);
      }
      return res.json();
    },
  });

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <p className="eyebrow">Customers</p>
          <h1>Customer List</h1>
        </div>
      </header>
      <section className="section">
        {isLoading && (
          <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu khách hàng...</p>
          </div>
        )}

        {isError && (
          <div className="error-state" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--danger-bg, #fee2e2)', borderRadius: '8px', color: 'var(--danger-text, #991b1b)' }}>
            <h3>Đã xảy ra lỗi khi tải dữ liệu</h3>
            <p>{error instanceof Error ? error.message : 'Lỗi không xác định'}</p>
            <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
          </div>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Chưa có khách hàng nào</h3>
            <p style={{ color: 'var(--text-muted)' }}>Hãy tạo khách hàng đầu tiên để bắt đầu quản lý.</p>
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
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
                  <td style={{ padding: '0.5rem' }}>{customer.kind === 'company' ? 'Công ty' : 'Cá nhân'}</td>
                  <td style={{ padding: '0.5rem' }}>{customer.email}</td>
                  <td style={{ padding: '0.5rem' }}>{customer.phone}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
