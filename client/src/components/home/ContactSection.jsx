import { Phone, Mail, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api.js';

export default function ContactSection() {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn:  () => settingsApi.get().then((d) => d.data),
    staleTime: Infinity,
  });

  const whatsapp = data?.whatsapp || '+1 (234) 567-890';
  const email    = data?.email    || 'hello@auraresin.art';
  const address  = data?.address  || '123 Artisan Way, Creative District';

  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-gutter">
        {/* Contact info */}
        <div className="lg:w-1/3 bg-white p-xxl rounded-2xl ambient-shadow reveal">
          <h2 className="font-playfair text-headline-lg mb-lg">Get in Touch</h2>
          <div className="space-y-lg">
            <div className="flex items-center gap-md">
              <Phone size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-inter font-semibold text-label-md">WhatsApp</p>
                <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`}
                  className="text-on-surface-variant font-inter text-body-md hover:text-primary transition-colors">
                  {whatsapp}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <Mail size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-inter font-semibold text-label-md">Email</p>
                <a href={`mailto:${email}`}
                  className="text-on-surface-variant font-inter text-body-md hover:text-primary transition-colors">
                  {email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <MapPin size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-inter font-semibold text-label-md">Studio</p>
                <p className="text-on-surface-variant font-inter text-body-md">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="lg:w-2/3 h-64 lg:h-auto rounded-2xl overflow-hidden ambient-shadow reveal bg-surface-container-high flex items-center justify-center"
          style={{ transitionDelay: '200ms' }}>
          <div className="text-center text-on-surface-variant">
            <MapPin size={48} className="mx-auto mb-md opacity-30" />
            <p className="font-inter text-body-md opacity-50">Map view</p>
          </div>
        </div>
      </div>
    </section>
  );
}
