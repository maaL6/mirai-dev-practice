import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Customer {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

interface Stage {
  id: string;
  name: string;
}

export interface OpportunityData {
  id?: string;
  name: string;
  expected_revenue: number | string;
  customer_id: string;
  contact_id: string;
  stage: string;
}

interface OpportunityFormProps {
  onClose: () => void;
  initialData?: OpportunityData;
}

function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export function OpportunityForm({ onClose, initialData }: OpportunityFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    expected_revenue: initialData?.expected_revenue || 0,
    customer_id: initialData?.customer_id || '',
    contact_id: initialData?.contact_id || '',
    stage: initialData?.stage || '',
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers/');
      const json = await res.json();
      return Array.isArray(json) ? json : json.results || [];
    }
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ['contacts', formData.customer_id],
    queryFn: async () => {
      if (!formData.customer_id) return [];
      const res = await fetch(`/api/customers/${formData.customer_id}/contacts/`);
      const json = await res.json();
      return Array.isArray(json) ? json : json.results || [];
    },
    enabled: !!formData.customer_id
  });

  const { data: stages } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: async () => {
      const res = await fetch('/api/crm/stages/');
      const json = await res.json();
      return Array.isArray(json) ? json : json.results || [];
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const csrfToken = getCookie('csrftoken');
      const method = initialData?.id ? 'PATCH' : 'POST';
      const url = initialData?.id ? `/api/crm/opportunities/${initialData.id}/` : '/api/crm/opportunities/';
      const payload = {
        name: data.name,
        expected_revenue: data.expected_revenue,
        customer: data.customer_id,
        contact: data.contact_id || null,
        stage: data.stage,
      };
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'customer_id' ? { contact_id: '' } : {}) // Reset contact if customer changes
    }));
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '2rem', background: '#fefefe', color: 'black' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
        {initialData ? 'Edit Opportunity' : 'Create Opportunity'}
      </h2>
      
      {mutation.error instanceof Error && (
        <div style={{ color: 'red', marginBottom: '1rem', background: '#ffebee', padding: '1rem', borderRadius: '4px' }}>
          <strong>Error:</strong> {mutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Expected Revenue</label>
          <input required type="number" step="0.01" name="expected_revenue" value={formData.expected_revenue} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Customer</label>
          <select required name="customer_id" value={formData.customer_id} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">Select Customer</option>
            {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contact</label>
          <select required name="contact_id" value={formData.contact_id} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} disabled={!formData.customer_id}>
            <option value="">Select Contact</option>
            {contacts?.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Stage</label>
          <select required name="stage" value={formData.stage} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">Select Stage</option>
            {stages?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={mutation.isPending} style={{ padding: '0.5rem 1rem', background: 'var(--accent, #1f6b4f)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#ccc', borderRadius: '4px', border: 'none', cursor: 'pointer', color: 'black' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
