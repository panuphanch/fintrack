import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { LoadingSpinner, ErrorMessage } from '../components/common';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const {
    data: invite,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invite', token],
    queryFn: () => authApi.getInvite(token!),
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: () => authApi.acceptInvite({ token: token!, name, password }),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      navigate('/');
    },
  });

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Invalid or expired invitation'}
          />
          <div className="mt-4 text-center">
            <Link to="/login" className="text-gold-400 hover:text-gold-300">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    acceptMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-gold-400">
            Join {invite?.householdName}
          </h2>
          <p className="mt-2 text-center text-sm text-[#a8a29e]">
            You've been invited to join a household on Financial Tracker
          </p>
          <p className="mt-1 text-center text-sm text-[#6b6560]">
            Invitation sent to: {invite?.email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {acceptMutation.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">
                {acceptMutation.error instanceof Error
                  ? acceptMutation.error.message
                  : 'Failed to accept invitation'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Create a password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={acceptMutation.isPending}
              className="btn-primary w-full"
            >
              {acceptMutation.isPending ? 'Joining...' : 'Join household'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
