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
        <button onClick={logout} className="btn-secondary">
          Log Out
        </button>
        <button className="btn-primary" onClick={openModal}>
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
