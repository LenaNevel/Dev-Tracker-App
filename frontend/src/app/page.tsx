import Link from 'next/link';
import './home.css';

export default function HomePage() {
  return (
    <main className="homepage">
      <img src="/images/working.svg" alt="Dev illustration" width="160" height="160" style={{ marginBottom: '2rem' }} />

      <h1>Welcome to Dev Tracker</h1>
      <p>Track your personal or team development tasks with ease.</p>

      <div className="links">
        <Link href="/register">Create Account</Link>
        <Link href="/login">Log In</Link>
      </div>
    </main>
  );
}
