import * as Dialog from '@radix-ui/react-dialog';
import { CustomerForm, CustomerFormData } from './CustomerForm';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function CustomerDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return apiClient.post('/api/customers/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setSubmitError('');
    },
    onError: (err: unknown) => {
      const detail = (err as { detail?: string })?.detail;
      setSubmitError(detail || 'Không thể tạo khách hàng.');
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="button button--primary">Thêm khách hàng</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          inset: 0,
          animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)'
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
          maxWidth: '450px',
        }}>
          <Dialog.Title style={{ margin: '0 0 1rem 0' }}>Tạo Khách hàng mới</Dialog.Title>
          
          {submitError && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {submitError}
            </div>
          )}

          <CustomerForm 
            onSubmit={(data) => mutation.mutate(data)} 
            isLoading={mutation.isPending} 
          />

          <Dialog.Close asChild>
            <button style={{ position: 'absolute', top: 10, right: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
