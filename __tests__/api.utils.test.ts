import { apiFetch } from '@lib/api';
import { getQueryParam } from '@utils/getQueryParam';
import { parseImages } from '@utils/parseImages';
import ApiError from '@utils/ApiError';
import { handleApiError } from '@utils/handleApiError';

describe('api helpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('apiFetch throws on error status', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, statusText: 'Bad', json: () => Promise.resolve({ message: 'Bad' }) })
    ) as any;
    await expect(apiFetch('/api')).rejects.toThrow('Bad');
  });

  test('apiFetch returns json', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
    ) as any;
    await expect(apiFetch('/api')).resolves.toEqual({ ok: true });
  });

  test('getQueryParam returns single value', () => {
    expect(getQueryParam('x')).toBe('x');
    expect(getQueryParam(['a', 'b'])).toBe('a');
    expect(getQueryParam(undefined)).toBeUndefined();
  });

  test('parseImages parses array', () => {
    expect(parseImages('["a.png"]')).toEqual([{ url: 'a.png' }]);
    expect(parseImages(null)).toEqual([]);
    expect(parseImages('bad')).toEqual([]);
  });

  test('handleApiError logs and responds', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as any;
    handleApiError(res, new Error('fail'), 'oops');
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'oops' });
    consoleSpy.mockRestore();
  });
});

