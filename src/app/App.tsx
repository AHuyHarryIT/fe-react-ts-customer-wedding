import { useState } from 'react';
import { Toaster } from 'sonner';
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import { HomePage } from '@/app/components/HomePage';
import { AuthPage } from '@/app/components/AuthPage';
import { PackagesPage } from '@/app/components/PackagesPage';
import { PackageDetailPage } from '@/app/components/PackageDetailPage';
import { BookingFlowPage } from '@/app/components/BookingFlowPage';
import { DashboardPage } from '@/app/components/DashboardPage';
import { BookingDetailPage } from '@/app/components/BookingDetailPage';
import { GalleryPage } from '@/app/components/GalleryPage';
import { MessagesPage } from '@/app/components/MessagesPage';
import { ProfilePage } from '@/app/components/ProfilePage';
import { ContactPage } from '@/app/components/ContactPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [previousPage, setPreviousPage] = useState('home');

  const handleNavigate = (page: string, data?: any) => {
    setPreviousPage(currentPage);
    setCurrentPage(page);
    setPageData(data || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentPage(previousPage);
    setPageData(null);
  };

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    handleNavigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'auth':
        return <AuthPage onLogin={handleLogin} />;
      
      case 'packages':
        return <PackagesPage onNavigate={handleNavigate} />;
      
      case 'package-detail':
        return (
          <PackageDetailPage
            packageData={pageData?.package}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'booking':
        return (
          <BookingFlowPage
            packageData={pageData?.package}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      
      case 'booking-detail':
        return <BookingDetailPage onBack={handleBack} />;
      
      case 'gallery':
        return <GalleryPage onNavigate={handleNavigate} />;
      
      case 'messages':
        return <MessagesPage />;
      
      case 'profile':
        return <ProfilePage />;
      
      case 'contact':
        return <ContactPage />;
      
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      <main>
        {renderPage()}
      </main>
      
      <Footer />
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #fecdd3',
          },
        }}
      />
    </div>
  );
}
