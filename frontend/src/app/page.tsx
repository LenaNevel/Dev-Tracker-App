import Link from 'next/link';
import './home.css'; // Optional: your own per-page styles

export default function HomePage() {
  return (
    <main className="homepage">
      <h1>Welcome to Dev Tracker</h1>
      <p>Track your personal or team development tasks with ease.</p>
      <div className="links">
        <Link href="/register">Create Account</Link>
        <Link href="/login">Log In</Link>
      </div>
    </main>
  );
}
