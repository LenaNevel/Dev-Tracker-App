import '../styles/globals.css';
import Header from '../components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <Header /> {/* if you use one */}
          {children}
          <footer className="footer">Built by Olena Nevel</footer>
        </div>
      </body>
    </html>
  );
}
