import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerForm, CustomerFormData } from './CustomerForm';
import { apiClient } from '../lib/api-client';

interface CustomerEditDialogProps {
  customer: { id: string; name?: string; kind?: 'company' | 'individual'; email?: string; phone?: string };
}

export function CustomerEditDialog({ customer }: CustomerEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return apiClient.patch(`/api/customers/${customer.id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setSubmitError('');
    },
    onError: (err: unknown) => {
      const detail = (err as { detail?: string; message?: string })?.detail || (err as { message?: string })?.message;
      setSubmitError(detail || 'Không thể cập nhật khách hàng.');
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="button button--secondary">Chỉnh sửa</button>
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
          maxWidth: '450px',
        }}>
          <Dialog.Title style={{ margin: '0 0 1rem 0' }}>Sửa Khách hàng</Dialog.Title>

          {submitError && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {submitError}
            </div>
          )}

          <CustomerForm 
            initialData={customer as CustomerFormData}
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
