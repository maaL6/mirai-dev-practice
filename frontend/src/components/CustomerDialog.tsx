import * as Dialog from '@radix-ui/react-dialog';
import { CustomerForm, CustomerFormData } from './CustomerForm';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function CustomerDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const res = await fetch('/api/customers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
    },
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
          boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '500px',
          maxHeight: '85vh',
          padding: '1.5rem',
          animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}>
          <Dialog.Title style={{ margin: '0 0 1rem 0', fontWeight: 600, fontSize: '1.25rem' }}>
            Thêm Khách hàng mới
          </Dialog.Title>
          <Dialog.Description style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)' }}>
            Nhập thông tin cho khách hàng mới. Tên khách hàng là bắt buộc.
          </Dialog.Description>
          
          <CustomerForm 
            onSubmit={(data) => mutation.mutate(data)}
            isLoading={mutation.isPending}
          />

          <Dialog.Close asChild>
            <button style={{
               fontFamily: 'inherit',
               borderRadius: '100%',
               height: '25px',
               width: '25px',
               display: 'inline-flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: 'var(--text-muted)',
               position: 'absolute',
               top: '10px',
               right: '10px',
               border: 'none',
               background: 'transparent',
               cursor: 'pointer'
            }} aria-label="Close">
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
