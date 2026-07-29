import { useState } from 'react';

export interface CustomerFormData {
  name: string;
  kind: 'company' | 'individual';
  email: string;
  phone: string;
}

interface CustomerFormProps {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>(
    initialData || { name: '', kind: 'company', email: '', phone: '' }
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Tên khách hàng không được để trống');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
          Tên khách hàng <span style={{ color: 'var(--danger-text, #dc2626)' }}>*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            border: `1px solid ${error ? 'var(--danger-border, #ef4444)' : 'var(--border-color)'}`,
            borderRadius: '4px' 
          }}
        />
        {error && <p style={{ color: 'var(--danger-text, #dc2626)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>}
      </div>

      <div>
        <label htmlFor="kind" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
          Phân loại
        </label>
        <select
          id="kind"
          value={formData.kind}
          onChange={(e) => setFormData({ ...formData, kind: e.target.value as 'company' | 'individual' })}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        >
          <option value="company">Công ty</option>
          <option value="individual">Cá nhân</option>
        </select>
      </div>

      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        />
      </div>

      <div>
        <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
          Số điện thoại
        </label>
        <input
          id="phone"
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          type="submit" 
          disabled={isLoading}
          className="button button--primary"
        >
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}
