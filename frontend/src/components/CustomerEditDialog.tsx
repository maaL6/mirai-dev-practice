import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerForm, CustomerFormData } from './CustomerForm';

interface CustomerEditDialogProps {
  customer: any;
}

export function CustomerEditDialog({ customer }: CustomerEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: You do not have permission to edit this customer.');
        throw new Error('Failed to update customer');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setSubmitError('');
    },
    onError: (err: any) => {
      setSubmitError(err.message);
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
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '500px',
          maxHeight: '85vh',
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <Dialog.Title style={{ margin: '0 0 1rem 0' }}>Chỉnh sửa Khách hàng</Dialog.Title>
          
          {submitError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem' }}>
              {submitError}
            </div>
          )}

          <CustomerForm 
            initialData={{
              name: customer.name,
              kind: customer.kind,
              email: customer.email,
              phone: customer.phone,
            }}
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
