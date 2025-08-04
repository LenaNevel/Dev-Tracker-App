'use client';

export default function AboutPage() {
  return (
    <main className="page">
      <div className="card-content">
        <h1 className="page-title">Trackly Has Landed 🚀</h1>
        <p className="tagline">
          A simple, personal issue tracker built for developers who want to stay in flow.
        </p>

        <p>
          Trackly is your no-fuss space to log bugs, track tasks, and move fast. It was built for solo devs, freelancers, and side project warriors who don’t want to drown in Jira boards or bloated dashboards.
        </p>

        <p>
          Most tools try to do everything. Trackly focuses on doing the right things — fast task creation, clear status updates, and a clean UI that stays out of your way. It respects your time and helps you ship.
        </p>

        <blockquote>
          “We built Trackly to feel like it gets out of your way — so you can stay in the zone.”<br />
          – Olena Nevel, Creator of Trackly
        </blockquote>

        <p>
          Ready to try it out? <strong>Create an account, log in, and spin up your first task.</strong> No walkthroughs, no setup wizard — just you and your workflow.
        </p>

        <blockquote>
          This is the kind of quote we <em>hope</em> to earn:<br />
          <em>“It’s like Trello and Jira had a baby — but one that actually respects my time.”</em>
        </blockquote>

        <p className="text-redirect" style={{ textAlign: 'center', marginTop: '2rem' }}>
          → <a href="/register">Create your account now</a> and take Trackly for a spin.
        </p>
      </div>
    </main>
  );
}