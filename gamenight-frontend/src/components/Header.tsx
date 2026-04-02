import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from './Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  // Classe utilitaire pour les liens actifs
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary-400 ${
      isActive ? 'text-primary-500' : 'text-dark-200'
    }`;

  return (
    <header className="bg-dark-900/90 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/20 group-hover:bg-primary-500 transition-colors">
              <span className="text-white font-black tracking-tighter">GN</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">
              Game Night
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <NavLink to="/" end className={navLinkClass}>Home</NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/create-event" className={navLinkClass}>Create Event</NavLink>
              </nav>

              <div className="h-6 w-px bg-dark-700 hidden md:block" />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full bg-dark-900/50 border border-dark-700 hover:border-dark-500 transition-all shadow-inner"
                >
                    <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white uppercase border border-primary-500/30">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-dark-100 hidden lg:inline">
                      {user.name}
                    </span>
                  <svg className={`w-4 h-4 text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-2 border-b border-dark-700 mb-1">
                      <p className="text-xs text-dark-400 uppercase font-bold tracking-wider">Account</p>
                      <p className="text-sm text-white truncate">{user.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Burger Menu (Mobile only) */}
              <button 
                className="md:hidden text-dark-200 p-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-dark-200">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu (Drawer style) */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t border-dark-700 animate-in slide-in-from-top duration-200">
            <NavLink to="/" end className="block px-4 py-2 text-dark-200 rounded-lg hover:bg-dark-700">Home</NavLink>
            <NavLink to="/dashboard" className="block px-4 py-2 text-dark-200 rounded-lg hover:bg-dark-700">Dashboard</NavLink>
            <NavLink to="/create-event" className="block px-4 py-2 text-dark-200 rounded-lg hover:bg-dark-700">Create Event</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
