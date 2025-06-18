'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid =
    username.trim() !== '' &&
    email.trim() !== '' &&
    password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setError(null);
    setLoading(true);

    try {
      const response = await registerUser({ username, email, password });

      if (response.status === 'success') {
        // maybe store token here if you use one
        router.push('/dashboard'); // log them in immediately
      }
      else {
        setError(response.errors?.[0] || response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="text-redirect">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  );
}
