'use client';

export default function AboutPage() {
  return (
    <main className="page">
      <div className="card-content">
        <h1 className="page-title">Dev Tracker Has Landed 🚀</h1>
        <p className="tagline">
          A simple, personal issue tracker for solo developers and small teams.
        </p>

        <p>
          Dev Tracker cuts through the noise of bloated tools. Built with speed and clarity in mind, it helps you stay in flow and ship faster — without getting buried in boards or buried in meetings.
        </p>

        <p>
          Most project trackers try to do everything. The result? Slow load times, endless configuration, and a UI that fights back. Dev Tracker gives you just what you need — quick task creation, clear ticket statuses, and nothing standing between you and shipping.
        </p>

        <blockquote>
          "We built Dev Tracker to feel like it gets out of your way — so you can stay in the zone." – Olena Nevel, Creator of Dev Tracker
        </blockquote>

        <p>
          Ready to try it? Just <strong>create an account, log in, and spin up your first task</strong>. No walkthrough required — you already know how it works.
        </p>

        <blockquote>
          This is the kind of quote we <em>hope</em> to earn:  
          <em>“It’s like Trello and Jira had a baby — but one that actually respects my time.”</em>
        </blockquote>

        <p className="text-redirect" style={{ textAlign: 'center', marginTop: '2rem' }}>
          → <a href="/register">Create your account now</a> and take Dev Tracker for a spin.
        </p>
      </div>
    </main>
  );
}
