'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

import { useTaskModal } from '../context/TaskModalContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { openModal } = useTaskModal();
  
  let actionButtons = (
    <Link href="/login" className="btn-primary">
      Log In
    </Link>
  );

  if (isAuthenticated) {
    actionButtons = (
      <div className="header-actions">
        <nav className="header-nav">
          <Link href="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link href="/account" className="nav-link">
            Account
          </Link>
        </nav>
        <div className="header-buttons">
          <button onClick={logout} className="btn-secondary">
            Log Out
          </button>
          <button className="btn-primary" onClick={openModal}>
            <span className="emoji">🔧</span> Spin Up a Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <header className="header">
      <Link href="/" className="logo">
        Trackly
      </Link>
      {actionButtons}
    </header>
  );
}
