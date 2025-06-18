'use client';

import './dashboard.css';

export default function DashboardPage() {
  return (
    <main className="page">
      <div className="dashboard-container">
        <div className="dashboard-title-section">
          <h2 className="dashboard-title">Welcome to Your Tracking Dashboard</h2>
          <p className="dashboard-subtitle">
            This is where your tracked issues will appear once you start creating them.
          </p>
          <p className="dashboard-subtitle">Let’s build something great 🚀</p>
        </div>
      </div>
    </main>
  );
}
