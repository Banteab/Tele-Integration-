import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ME</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">menahariya</span>
            </div>
            <p className="text-sm leading-6 text-gray-400">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
            
            {/* App Download Links */}
            <div className="flex gap-4 pt-4">
              <a href="#" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-700">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-8" />
              </a>
              <a href="#" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-700">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-8" />
              </a>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">{t('routes.title')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('routes.addisAbaba')} - {t('routes.hawassa')}</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('routes.addisAbaba')} - {t('routes.bahirDar')}</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('routes.addisAbaba')} - {t('routes.direDawa')}</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('routes.hawassa')} - {t('routes.bahirDar')}</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('routes.hawassa')} - {t('routes.direDawa')}</a>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">{t('footer.quickLinks')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('booking.downloadTicket')}</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">Terms & Conditions</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">Refund Policy</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 hover:text-blue-400 transition-colors">{t('nav.contact')}</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">{t('footer.contact')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm leading-6">Call Center</p>
                      <a href="tel:8000" className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">8000</a>
                      <p className="text-sm text-gray-400 mt-1">0911-000333</p>
                      <p className="text-sm text-gray-400">+251 911444222</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                    <a href="mailto:info@menahariya.com" className="text-sm leading-6 hover:text-blue-400 transition-colors">info@menahariya.com</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t border-gray-800 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} menahariya LTD. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{t('footer.payment')}:</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-[10px] font-bold">Telebirr</div>
                <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-[10px] font-bold">CBE Birr</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
