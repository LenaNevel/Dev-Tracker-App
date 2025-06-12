'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <h1 className="logo">Dev Tracker</h1>
      <Link href="/login" className="login-link">
        Log In
      </Link>
    </header>
  );
}
