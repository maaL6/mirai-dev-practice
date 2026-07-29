import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  http.get('/api/customers/', async ({ request }) => {
    await delay(1000); // Tăng delay để hiển thị skeleton/spinner rõ hơn
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const kind = url.searchParams.get('kind') || '';
    const active = url.searchParams.get('active');

    let data = [
      {
        id: '1',
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
        id: '2',
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
];
