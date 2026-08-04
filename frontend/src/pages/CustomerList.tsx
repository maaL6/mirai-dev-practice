import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerDialog } from '../components/CustomerDialog';
import { apiClient } from '../lib/api-client';

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
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [active, setActive] = useState('');

  const { data, isLoading, isError, error } = useQuery<{ results: Customer[] } | Customer[]>({
    queryKey: ['customers', search, kind, active],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (kind) params.append('kind', kind);
      if (active) params.append('active', active);

      return apiClient.get(`/api/customers/?${params.toString()}`);
    },
  });

  const customersList: Customer[] = Array.isArray(data) ? data : data?.results || [];

  return (
    <main className="main-content">
      <header className="topbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <p className="eyebrow">Customers</p>
            <h1>Customer List</h1>
          </div>
          <CustomerDialog />
        </div>
      </header>

      <section className="section">
        <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, minWidth: '200px' }}
          />
          <select 
            value={kind} 
            onChange={(e) => setKind(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <option value="">Tất cả phân loại</option>
            <option value="company">Công ty</option>
            <option value="individual">Cá nhân</option>
          </select>
          <select 
            value={active} 
            onChange={(e) => setActive(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {isLoading && (
          <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu khách hàng...</p>
          </div>
        )}

        {isError && (
          <div className="error-state" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--danger-bg, #fee2e2)', borderRadius: '8px', color: 'var(--danger-text, #991b1b)' }}>
            <h3>Đã xảy ra lỗi khi tải dữ liệu</h3>
            <p>{(error as { detail?: string })?.detail || (error instanceof Error ? error.message : 'Lỗi không xác định')}</p>
          </div>
        )}

        {!isLoading && !isError && customersList.length === 0 && (
          <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Không tìm thấy kết quả</h3>
            <p style={{ color: 'var(--text-muted)' }}>Không có khách hàng nào khớp với bộ lọc và tìm kiếm của bạn.</p>
          </div>
        )}

        {!isLoading && !isError && customersList.length > 0 && (
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
              {customersList.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <a href={`#/contacts/${customer.id}`} style={{ color: 'var(--accent-color, #2563eb)', textDecoration: 'none', fontWeight: 600 }}>
                      {customer.name}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{customer.kind === 'company' ? 'Công ty' : 'Cá nhân'}</td>
                  <td style={{ padding: '0.5rem' }}>{customer.email || '--'}</td>
                  <td style={{ padding: '0.5rem' }}>{customer.phone || '--'}</td>
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
