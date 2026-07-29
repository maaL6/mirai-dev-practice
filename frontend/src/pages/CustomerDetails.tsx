import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContactForm } from '../components/ContactForm';
import { CustomerEditDialog } from '../components/CustomerEditDialog';
import { useState } from 'react';

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [deactivateError, setDeactivateError] = useState('');

  const { data: customer, isLoading, isError, error } = useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${id}`);
      if (res.status === 404) throw new Error('Not Found');
      if (!res.ok) throw new Error('API Error');
      return res.json();
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ['customers', id, 'contacts'],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${id}/contacts/`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!customer && customer.kind === 'company',
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/customers/${id}/deactivate/`, {
        method: 'POST'
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Bạn không có quyền vô hiệu hóa khách hàng này.');
        throw new Error('Lỗi hệ thống');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeactivateError('');
    },
    onError: (err: any) => {
      setDeactivateError(err.message);
    }
  });

  if (isLoading) {
    return (
      <main className="main-content">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
      </main>
    );
  }

  if (isError && error.message === 'Not Found') {
    return (
      <main className="main-content">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>404 - Khách hàng không tồn tại</h2>
          <Link to="/contacts" className="button">Quay lại danh sách</Link>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="main-content">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          Đã xảy ra lỗi khi tải dữ liệu
        </div>
      </main>
    );
  }

  const handleDeactivate = () => {
    if (confirm('Bạn có chắc chắn muốn vô hiệu hóa khách hàng này không?')) {
      deactivateMutation.mutate();
    }
  };

  return (
    <main className="main-content">
      <header className="topbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <p className="eyebrow">
              <Link to="/contacts" style={{ color: 'inherit', textDecoration: 'none' }}>Customers</Link> / {customer?.name}
            </p>
            <h1>{customer?.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <CustomerEditDialog customer={customer} />
            {customer?.is_active && (
              <button 
                className="button" 
                style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
              >
                Vô hiệu hóa
              </button>
            )}
          </div>
        </div>
      </header>

      {deactivateError && (
        <div style={{ margin: '1rem 2rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
          {deactivateError}
        </div>
      )}

      <section className="section" style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ backgroundColor: 'var(--surface-bg, white)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3>Thông tin chung</h3>
          <p><strong>Loại:</strong> {customer?.kind === 'company' ? 'Công ty' : 'Cá nhân'}</p>
          <p><strong>Email:</strong> {customer?.email}</p>
          <p><strong>Điện thoại:</strong> {customer?.phone}</p>
          <p><strong>Trạng thái:</strong> {customer?.is_active ? 'Active' : 'Inactive'}</p>
        </div>

        {customer?.kind === 'company' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Người liên hệ (Contacts)</h3>
              <ContactForm customerId={id!} />
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Tên</th>
                  <th style={{ padding: '0.5rem' }}>Chức vụ</th>
                  <th style={{ padding: '0.5rem' }}>Email</th>
                  <th style={{ padding: '0.5rem' }}>Điện thoại</th>
                </tr>
              </thead>
              <tbody>
                {contacts?.length > 0 ? contacts.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem' }}>{c.name}</td>
                    <td style={{ padding: '0.5rem' }}>{c.position}</td>
                    <td style={{ padding: '0.5rem' }}>{c.email}</td>
                    <td style={{ padding: '0.5rem' }}>{c.phone}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có người liên hệ nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
