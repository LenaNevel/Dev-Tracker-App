'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <h2 className="auth-title">Create Your Account</h2>
      <form className="auth-form">
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />

        <button type="submit" className="btn-primary">Sign Up</button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
