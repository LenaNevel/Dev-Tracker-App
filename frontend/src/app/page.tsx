// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <main className="homepage">
        <div className="hero-top">
          <h2 className="title">Track, Prioritize, Ship — Your Way.</h2>
          <img
            src="/images/working.svg"
            alt="Dev illustration"
            className="hero-img"
          />
        </div>

        <div className="hero-body">
          <p className="tagline">
            Stay focused, organized, and in control of your workflow — without the bloat.
          </p>
          <div className="links">
            <Link href="/register" className="btn-primary">Create Account</Link>
            <Link href="/login" className="btn-secondary">Log In</Link>
          </div>
          <p className="description">
            Trackly is a simple, personal issue tracker designed for solo developers and small teams.
          </p>
        </div>
      </main>
    </>
  );
}
