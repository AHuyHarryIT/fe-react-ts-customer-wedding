import { Link } from '@tanstack/react-router';
import { FiHeart, FiInstagram, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-rose-50 to-white border-t border-rose-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                <FiHeart className="size-4 text-white" />
              </div>
              <span className="font-serif text-lg text-gray-800">Studio HaMy</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Capturing your precious moments with elegance and artistry.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone className="size-4 text-rose-400" />
                <span>+84 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMail className="size-4 text-rose-400" />
                <span>studiohamy@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMapPin className="size-4 text-rose-400" />
                <span>20 Cong Hoa, HCM City</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-rose-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/packages"
                  className="text-sm text-gray-600 hover:text-rose-500 transition-colors"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-sm text-gray-600 hover:text-rose-500 transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-600 hover:text-rose-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Follow Us</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Studio HaMy on Instagram"
                className="size-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-200 transition-colors"
              >
                <FiInstagram className="size-4" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Studio HaMy on Facebook"
                className="size-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-200 transition-colors"
              >
                <FiFacebook className="size-4" />
              </a>
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:studiohamy@gmail.com?subject=Privacy%20Policy%20Request"
                  className="text-sm text-gray-600 hover:text-rose-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="mailto:studiohamy@gmail.com?subject=Terms%20of%20Service%20Request"
                  className="text-sm text-gray-600 hover:text-rose-500 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-rose-100 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2026 Studio HaMy Wedding Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
