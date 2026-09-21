import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PopularRoutes() {
  const { t } = useTranslation();

  const routes = [
    {
      from: t('routes.addisAbaba'),
      to: t('routes.hawassa'),
      price: '450',
      image: 'https://images.unsplash.com/photo-1608958435020-e855e0509231?q=80&w=1000&auto=format&fit=crop',
    },
    {
      from: t('routes.addisAbaba'),
      to: t('routes.bahirDar'),
      price: '850',
      image: 'https://images.unsplash.com/photo-1622227432807-91eb590c11f5?q=80&w=1000&auto=format&fit=crop',
    },
    {
      from: t('routes.addisAbaba'),
      to: t('routes.direDawa'),
      price: '750',
      image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('routes.title')}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {t('routes.subtitle')}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {routes.map((route, index) => (
            <motion.article 
              key={route.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-start justify-between bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
            >
              <div className="relative w-full">
                <img
                  src={route.image}
                  alt={`${route.from} to ${route.to}`}
                  className="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div className="max-w-xl p-6 w-full">
                <div className="flex items-center justify-between gap-x-4 text-xs">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span>{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <span>{route.to}</span>
                  </div>
                  <span className="relative z-10 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-600">
                    {t('routes.from')} ETB {route.price}
                  </span>
                </div>
                <div className="group relative mt-4">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-blue-600 transition-colors">
                    <a href="#">
                      <span className="absolute inset-0" />
                      {route.from} {t('routes.to')} {route.to}
                    </a>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                    {t('features.items.luxury.desc')} {t('routes.multipleDepartures')}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
