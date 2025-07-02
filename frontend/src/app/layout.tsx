import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer'; // if you've made it one
import { AuthProvider } from '../context/AuthContext';
import { TaskModalProvider } from '../context/TaskModalContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TaskModalProvider>
            <div className="layout-container">
              <Header />
              {children}
              <Footer />
            </div>
          </TaskModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
