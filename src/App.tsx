import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import ChatPage from './components/ChatPage';
import { UserProfile } from './components/AuthModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'chat'>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Sync hash with current page if user uses browser back/forward or direct link
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#chat') {
        setCurrentPage('chat');
      } else if (hash === '#home' || hash === '' || hash === '#hero-top') {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthenticated = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentPage('chat');
    window.location.hash = '#chat';
  };

  const handleGoToChat = () => {
    setCurrentPage('chat');
    window.location.hash = '#chat';
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.location.hash = '#home';
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    window.location.hash = '#home';
  };

  return (
    <div className="min-h-screen bg-[hsl(260_87%_3%)] text-[hsl(40_6%_95%)] selection:bg-[#6366f1]/30 selection:text-white">
      {currentPage === 'home' ? (
        <HeroSection
          currentUser={currentUser}
          onAuthenticated={handleAuthenticated}
          onGoToChat={handleGoToChat}
          onLogout={handleLogout}
        />
      ) : (
        <ChatPage
          currentUser={currentUser}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
