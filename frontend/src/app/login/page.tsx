'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isValid = email.trim() !== '' && password.length >= 6;

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!isValid) return;

  setError(null);
  setLoading(true);

  try {
    const response = await loginUser({ email, password });

    if (response.status === 'success') {
      login(response?.data?.access_token);
      router.push('/dashboard'); // or any route for logged-in users
    } else {
      // Handle known error response
      setError(response.error || 'Login failed');
    }
  } catch (err) {
    // Handle unexpected errors (network/server errors)
    console.error('Unexpected login error:', err);
    setError('An unexpected error occurred.');
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="page">
      <div className="auth-card">
        <h2 className="auth-title">Log In</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" disabled={loading || !isValid}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="text-redirect">
          <a href="/register">Create New Account</a>
        </p>
      </div>
    </main>
  );
}
