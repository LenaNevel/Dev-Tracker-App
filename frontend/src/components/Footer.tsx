'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer-credit">Built by Olena Nevel</span>

      <div className="footer-links">
        <Link href="/about" className="footer-link">
          Discover the Story
        </Link>
        <a
          href="https://github.com/your-username"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <img src="/images/github.svg" alt="GitHub" className="footer-icon" />
        </a>
        <a
          href="https://linkedin.com/in/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <img src="/images/linkedin.svg" alt="LinkedIn" className="footer-icon" />
        </a>
      </div>
    </footer>
  );
}
