'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  let actionButtons = (
    <Link href="/login" className="btn-primary">
      Log In
    </Link>
  );

  if (isAuthenticated) {
    actionButtons = (
      <div className="header-actions">
        <button onClick={logout} className="btn-secondary">
          Log Out
        </button>
        <button className="btn-primary">
          <span className="emoji">🔧</span> Spin Up a Task
        </button>
      </div>
    );
  }

  return (
    <header className="header">
      <Link href="/" className="logo">
        Dev Tracker
      </Link>
      {actionButtons}
    </header>
  );
}
