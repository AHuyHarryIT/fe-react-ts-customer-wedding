import { Link, useRouterState, type LinkComponentProps } from '@tanstack/react-router';
import { useState } from 'react';
import { FiHeart, FiMenu, FiUser, FiX } from 'react-icons/fi';
import type { NavigationProps } from '@/types/components';

export function Navigation({ isLoggedIn, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const menuItems: { id: LinkComponentProps['to']; label: string }[] = [
    { id: '/', label: 'Home' },
    { id: '/packages', label: 'Packages' },
    { id: '/contact', label: 'Contact' },
  ];

  const menuItemsLoggedIn: { id: LinkComponentProps['to']; label: string }[] = [
    { id: '/dashboard', label: 'Home' },
    { id: '/packages', label: 'Packages' },
    { id: '/gallery', label: 'Gallery' },
    { id: '/messages', label: 'Messages' },
    { id: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
              <FiHeart className="size-5 text-white" />
            </div>
            <span className="text-xl font-serif text-gray-800">Studio HaMy</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {(isLoggedIn ? menuItemsLoggedIn : menuItems).map((item) => (
              <Link
                key={`nav-${item.id}`}
                to={item.id}
                className={`text-sm transition-colors ${
                  pathname === item.id
                    ? 'text-rose-500 font-medium'
                    : 'text-gray-600 hover:text-rose-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <FiUser className="size-4" />
                  <span className="text-sm">Profile</span>
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-rose-100 py-2">
                    <Link
                      to="/profile"
                      onClick={() => {
                        setProfileMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileMenuOpen ? <FiX className="size-6" /> : <FiMenu className="size-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-rose-100">
            {(isLoggedIn ? menuItemsLoggedIn : menuItems).map((item) => (
              <Link
                key={item.id}
                to={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 ${
                  pathname === item.id ? 'text-rose-500 bg-rose-50' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                to="/auth"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full"
              >
                Login
              </Link>
            )}
            {isLoggedIn && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-600 mt-2"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
