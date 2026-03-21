// Test the core fetchApi function behavior through the public API methods

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  (localStorage.getItem as any).mockReturnValue(null);
});

// We need to import after mocking fetch
const { authApi, cardsApi } = await import('./api');

describe('fetchApi (via public API methods)', () => {
  it('should add auth header when token exists', async () => {
    (localStorage.getItem as any).mockReturnValue('test-token');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    await cardsApi.list();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer test-token');
  });

  it('should not add auth header when no token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    await cardsApi.list();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('should set Content-Type for requests with body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { token: 'x', user: {} } }),
    });

    await authApi.login('test@test.com', 'pass');

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should not set Content-Type for GET requests', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    await cardsApi.list();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('should throw ApiError on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, error: 'Bad request' }),
    });

    await expect(cardsApi.list()).rejects.toThrow('Bad request');
  });

  it('should remove token on 401', async () => {
    (localStorage.getItem as any).mockReturnValue('test-token');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
    });

    await expect(cardsApi.list()).rejects.toThrow('Unauthorized');
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should use default error message when none provided', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ success: false }),
    });

    await expect(cardsApi.list()).rejects.toThrow('An error occurred');
  });
});
