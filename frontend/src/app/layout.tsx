import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer'; // if you've made it one

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <Header />
          {children}
          <Footer /> {/* or <footer className="footer">Built by Olena Nevel</footer> */}
        </div>
      </body>
    </html>
  );
}
