import { http, HttpResponse, delay } from 'msw';

let customersData = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Acme Ltd',
    kind: 'company',
    email: 'contact@acme.com',
    phone: '123-456-7890',
    owner: 'minh@example.test',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Nova Studio',
    kind: 'company',
    email: 'hello@novastudio.com',
    phone: '987-654-3210',
    owner: 'minh@example.test',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let contactsData: Record<string, any[]> = {
  '11111111-1111-1111-1111-111111111111': [
    { id: '33333333-3333-3333-3333-333333333333', name: 'Alice', position: 'CEO', email: 'alice@acme.com', phone: '111-222' }
  ]
};

export const handlers = [
  http.get('/api/customers/', async ({ request }) => {
    await delay(1000); // Tăng delay để hiển thị skeleton/spinner rõ hơn
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const kind = url.searchParams.get('kind') || '';
    const active = url.searchParams.get('active');

    let data = [...customersData];

    if (search) {
      data = data.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.email.toLowerCase().includes(search) || 
        c.phone.includes(search)
      );
    }
    
    if (kind) {
      data = data.filter(c => c.kind === kind);
    }

    if (active !== null && active !== '') {
      const isActiveBool = active === 'true';
      data = data.filter(c => c.is_active === isActiveBool);
    }

    return HttpResponse.json(data);
  }),

  http.post('/api/customers/', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as any;
    
    if (!body.name) {
      return HttpResponse.json({ detail: 'Name is required' }, { status: 400 });
    }

    const newCustomer = {
      id: crypto.randomUUID(),
      name: body.name,
      kind: body.kind || 'company',
      email: body.email || '',
      phone: body.phone || '',
      owner: 'minh@example.test',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    customersData = [newCustomer, ...customersData];

    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  http.get('/api/customers/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const customer = customersData.find(c => c.id === id);
    if (!customer) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(customer);
  }),

  http.get('/api/customers/:id/contacts/', async ({ params }) => {
    await delay(500);
    const { id } = params;
    return HttpResponse.json(contactsData[id as string] || []);
  }),

  http.post('/api/customers/:id/contacts/', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const body = await request.json() as any;
    
    if (!body.name) {
      return HttpResponse.json({ detail: 'Name is required' }, { status: 400 });
    }

    const newContact = {
      id: crypto.randomUUID(),
      name: body.name,
      position: body.position || '',
      email: body.email || '',
      phone: body.phone || '',
    };

    if (!contactsData[id as string]) {
      contactsData[id as string] = [];
    }
    contactsData[id as string].push(newContact);

    return HttpResponse.json(newContact, { status: 201 });
  }),

  http.patch('/api/customers/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    
    if (id === '403') {
      return HttpResponse.json({ detail: 'Forbidden' }, { status: 403 });
    }

    const customerIndex = customersData.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    }

    const body = await request.json() as any;
    customersData[customerIndex] = { ...customersData[customerIndex], ...body };
    
    return HttpResponse.json(customersData[customerIndex]);
  }),

  http.post('/api/customers/:id/deactivate/', async ({ params }) => {
    await delay(500);
    const { id } = params;

    if (id === '403') {
      return HttpResponse.json({ detail: 'Forbidden' }, { status: 403 });
    }

    const customerIndex = customersData.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    }

    customersData[customerIndex].is_active = false;
    
    return HttpResponse.json(customersData[customerIndex]);
  }),
];
