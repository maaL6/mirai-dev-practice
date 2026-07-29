import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/customers/', () => {
    return HttpResponse.json([
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
    ]);
  }),
];
