'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo">
        Dev Tracker
      </Link>
      <Link href="/login" className="login-link">
        Log In
      </Link>
    </header>
  );
}
