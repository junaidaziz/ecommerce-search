import handler from '@pages/api/trending';

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('trending API', () => {
  test('returns trending keywords', () => {
    const req = { method: 'GET' } as any;
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      keywords: expect.any(Array),
    });
  });

  test('rejects wrong method', () => {
    const req = { method: 'POST' } as any;
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ keywords: [] });
  });
});
