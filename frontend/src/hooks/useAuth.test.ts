import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { authApi } from '../lib/api';
import { createWrapper } from '../__tests__/test-utils';

vi.mock('../lib/api', () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  vi.clearAllMocks();
  (localStorage.getItem as any).mockReturnValue(null);
});

describe('useAuth', () => {
  it('should not fetch user when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it('should fetch user when token exists', async () => {
    const mockUser = { id: 'u1', name: 'Test', email: 'test@test.com' };
    (localStorage.getItem as any).mockReturnValue('test-token');
    (authApi.me as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login and set token', async () => {
    const loginResponse = { token: 'new-token', user: { id: 'u1', name: 'Test' } };
    (authApi.login as any).mockResolvedValue(loginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'pass' });
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
  });

  it('should register and set token', async () => {
    const registerResponse = { token: 'new-token', user: { id: 'u1', name: 'Test' } };
    (authApi.register as any).mockResolvedValue(registerResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
        householdName: 'Home',
      });
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
  });

  it('should logout and navigate to login', async () => {
    (localStorage.getItem as any).mockReturnValue('test-token');
    (authApi.logout as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });
});
