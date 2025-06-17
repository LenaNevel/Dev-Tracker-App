'use client';
import { useState } from 'react';

export default function LoginPage() {

  return (
     <main className="page">
      <div className="auth-card">
        <h2 className="auth-title">Log In</h2>

        <form className="auth-form">
          <input type="email" name="email" placeholder="Email address" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit" className="btn-primary">Log In</button>
        </form>

        <p className="text-redirect">
          <a href="/register">Create New Account</a>
        </p>
      </div>
    </main>
  );
}
