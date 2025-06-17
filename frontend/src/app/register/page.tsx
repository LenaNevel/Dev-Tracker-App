// src/app/auth/page.tsx
'use client';
export default function authPage() {
  return (
    <main className="page">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>

        <form className="auth-form">
          <input type="text" name="username" placeholder="Username" required />
          <input type="email" name="email" placeholder="Email address" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit" className="btn-primary">Create Account</button>
        </form>

        <p className="text-redirect">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  );
}
