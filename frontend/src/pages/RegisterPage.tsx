import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const { register, isRegistering, registerError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password, householdName });
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-gold-400">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-[#a8a29e]">
            Start tracking your credit card spending
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {registerError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">
                {registerError instanceof Error ? registerError.message : 'Registration failed'}
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
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
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

            <div>
              <label htmlFor="householdName" className="label">
                Household name
              </label>
              <input
                id="householdName"
                name="householdName"
                type="text"
                required
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="input-field"
                placeholder="The Smiths"
              />
              <p className="mt-1 text-xs text-[#6b6560]">
                This will be shared with your partner
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isRegistering}
              className="btn-primary w-full"
            >
              {isRegistering ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <p className="text-center text-sm text-[#a8a29e]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gold-400 hover:text-gold-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
