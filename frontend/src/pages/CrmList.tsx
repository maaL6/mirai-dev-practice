import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OpportunityForm, OpportunityData } from '../components/OpportunityForm';

interface Opportunity {
  id: string;
  name: string;
  customer_id: string;
  stage: string;
  expected_revenue: string;
  owner: string;
  contact_id?: string;
}

export function CrmList() {
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState<OpportunityData | undefined>(undefined);
  
  const [filterStage, setFilterStage] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

  // Fetch stages and customers for filter dropdowns
  const { data: stages } = useQuery({
    queryKey: ['stages'],
    queryFn: async () => {
      const res = await fetch('/api/crm/stages/');
      const json = await res.json();
      return Array.isArray(json) ? json : json.results || [];
    }
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers/');
      const json = await res.json();
      return Array.isArray(json) ? json : json.results || [];
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['opportunities', filterStage, filterCustomer],
    queryFn: async () => {
      let url = '/api/crm/opportunities/';
      const params = new URLSearchParams();
      if (filterStage) params.append('stage', filterStage);
      if (filterCustomer) params.append('customer_id', filterCustomer);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        throw new Error('Unauthorized. Please log in via Django admin first.');
      }
      if (!res.ok) {
        throw new Error(`Failed to load opportunities: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      return Array.isArray(json) ? json : (json.results || []);
    },
  });

  const opportunities = data || [];

  const handleEdit = (opp: Opportunity) => {
    setEditingOpp({
      id: opp.id,
      name: opp.name,
      expected_revenue: opp.expected_revenue,
      customer_id: opp.customer_id,
      contact_id: opp.contact_id || '',
      stage: opp.stage,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOpp(undefined);
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Opportunities</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ padding: '0.5rem 1rem', background: 'var(--accent, #1f6b4f)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>+ Opportunity</button>
        )}
      </header>

      {!showForm && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', background: '#fefefe', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Filter by Stage</label>
            <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">All Stages</option>
              {stages?.map((s: { id: string; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Filter by Customer</label>
            <select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">All Customers</option>
              {customers?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {showForm && <OpportunityForm onClose={handleCloseForm} initialData={editingOpp} />}

      {!showForm && isLoading && <p>Loading opportunities...</p>}
      {error && (
        <div style={{ background: 'var(--danger, #a54035)', color: 'white', padding: '1rem', borderRadius: '4px' }}>
          {error instanceof Error ? error.message : 'Error loading opportunities.'}
        </div>
      )}
      
      {!showForm && !isLoading && !error && data && (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--muted-ink, #5f6e64)' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Customer</th>
              <th style={{ padding: '0.75rem' }}>Stage</th>
              <th style={{ padding: '0.75rem' }}>Revenue</th>
              <th style={{ padding: '0.75rem' }}>Owner</th>
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp: Opportunity) => (
              <tr key={opp.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '0.75rem' }}>{opp.name}</td>
                <td style={{ padding: '0.75rem' }}>{opp.customer_id}</td>
                <td style={{ padding: '0.75rem' }}>{opp.stage}</td>
                <td style={{ padding: '0.75rem' }}>${opp.expected_revenue}</td>
                <td style={{ padding: '0.75rem' }}>{opp.owner}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button onClick={() => handleEdit(opp)} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: '#e0e0e0', border: '1px solid #ccc', borderRadius: '4px' }}>Edit</button>
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-ink)' }}>No opportunities found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
