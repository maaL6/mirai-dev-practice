import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface ContactFormProps {
  customerId: string;
}

export function ContactForm({ customerId }: ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post(`/api/customers/${customerId}/contacts/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId, 'contacts'] });
      setOpen(false);
      setName(''); setPosition(''); setEmail(''); setPhone('');
    },
    onError: (err: any) => {
      setError(err.detail || 'Không thể tạo người liên hệ.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên không được để trống');
      return;
    }
    setError('');
    mutation.mutate({ name, position, email, phone });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="button button--secondary" style={{ fontSize: '0.875rem' }}>+ Thêm liên hệ</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          inset: 0,
        }} />
        <Dialog.Content style={{
          backgroundColor: 'var(--surface-bg, white)',
          borderRadius: '8px',
          padding: '1.5rem',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '400px',
        }}>
          <Dialog.Title style={{ margin: '0 0 1rem 0' }}>Thêm Người liên hệ</Dialog.Title>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Tên *</label>
              <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
              {error && <span style={{ color: 'red', fontSize: '0.75rem' }}>{error}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Chức vụ</label>
              <input value={position} onChange={e => setPosition(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Điện thoại</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={mutation.isPending} className="button button--primary">
                {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button style={{ position: 'absolute', top: 10, right: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
