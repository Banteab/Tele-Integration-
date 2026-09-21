import { Phone, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Props {
  onHomeClick?: () => void;
  onCancelClick?: () => void;
}

export default function Navbar({ onHomeClick, onCancelClick }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const links = [
    { name: t('nav.home'), href: '#', action: onHomeClick },
    { name: t('nav.cancelTicket'), href: '#', action: onCancelClick },
    { name: t('nav.contact'), href: '#' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <a href="#" onClick={(e) => { e.preventDefault(); onHomeClick?.(); }} className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-[#7a1f35] rounded-full flex items-center justify-center border-2 border-[#c9922a]">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-bold text-2xl text-[#7a1f35] tracking-tight">Menahariya</span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.action) {
                    e.preventDefault();
                    link.action();
                  }
                }}
                className="text-gray-600 hover:text-[#7a1f35] px-2 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            <div className="flex items-center gap-1 text-gray-600 hover:text-[#7a1f35] px-2">
              <Globe className="w-4 h-4" />
              <select 
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromoo</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[#7a1f35] font-semibold bg-amber-50 px-4 py-2 rounded-full border border-[#e8dcc8]">
              <Phone className="w-4 h-4" />
              <span>8000</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <div className="flex items-center gap-1 text-gray-600 mr-4">
              <Globe className="w-4 h-4" />
              <select 
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none"
              >
                <option value="en">EN</option>
                <option value="am">አማ</option>
                <option value="om">OR</option>
              </select>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7a1f35]"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.action) {
                      e.preventDefault();
                      link.action();
                      setIsOpen(false);
                    }
                  }}
                  className="text-gray-600 hover:text-[#7a1f35] hover:bg-amber-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex items-center gap-2 text-[#7a1f35] font-semibold px-3 py-2">
                <Phone className="w-4 h-4" />
                <span>8000</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
