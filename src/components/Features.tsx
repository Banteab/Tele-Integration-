import { motion } from 'motion/react';
import { 
  Bus, 
  Sofa, 
  Ticket, 
  UserCheck, 
  Wifi, 
  Video, 
  BatteryCharging, 
  Headset 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      name: t('features.items.luxury.name'),
      description: t('features.items.luxury.desc'),
      icon: Bus,
    },
    {
      name: t('features.items.seat.name'),
      description: t('features.items.seat.desc'),
      icon: Sofa,
    },
    {
      name: t('features.items.online.name'),
      description: t('features.items.online.desc'),
      icon: Ticket,
    },
    {
      name: t('features.items.driver.name'),
      description: t('features.items.driver.desc'),
      icon: UserCheck,
    },
    {
      name: t('features.items.wifi.name'),
      description: t('features.items.wifi.desc'),
      icon: Wifi,
    },
    {
      name: t('features.items.cctv.name'),
      description: t('features.items.cctv.desc'),
      icon: Video,
    },
    {
      name: t('features.items.usb.name'),
      description: t('features.items.usb.desc'),
      icon: BatteryCharging,
    },
    {
      name: t('features.items.support.name'),
      description: t('features.items.support.desc'),
      icon: Headset,
    },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">{t('features.badge')}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('features.title')}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto text-sm">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
