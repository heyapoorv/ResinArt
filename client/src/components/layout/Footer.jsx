import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api.js';

export default function Footer() {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((d) => d.data),
    staleTime: Infinity,
  });

  const name      = data?.businessName || 'AURA RESIN';
  const instagram = data?.instagram;
  const facebook  = data?.facebook;
  const email     = data?.email     || 'hello@auraresin.art';
  const whatsapp  = data?.whatsapp  || '';

  return (
    <footer className="bg-surface-container-lowest w-full py-xxl border-t border-outline-variant">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter
                      px-margin-mobile md:px-margin-desktop">
        {/* Brand */}
        <div className="col-span-1">
          <div className="font-playfair text-headline-md text-primary mb-md font-bold">{name}</div>
          <p className="text-on-surface-variant font-inter text-caption leading-relaxed">
            Artisan resin pieces that bring the organic beauty of fluid motion into your contemporary living spaces.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-inter text-label-md text-primary mb-md uppercase tracking-wider">Shop</h4>
          <ul className="space-y-sm">
            {[
              ['All Products', '/collection'],
              ['Featured',     '/collection?featured=true'],
              ['New Arrivals', '/collection?sort=newest'],
            ].map(([l, h]) => (
              <li key={l}>
                <Link to={h} className="text-on-surface-variant hover:text-primary transition-colors text-caption font-inter">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-inter text-label-md text-primary mb-md uppercase tracking-wider">Support</h4>
          <ul className="space-y-sm">
            {['Artisan Care', 'Shipping & Returns', 'Privacy Policy', 'Terms of Service'].map((l) => (
              <li key={l}>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-caption font-inter">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="font-inter text-label-md text-primary mb-md uppercase tracking-wider">Follow the Process</h4>
          <div className="flex gap-md mb-md">
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors text-caption font-inter">
                Instagram
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors text-caption font-inter">
                Facebook
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}
                className="text-on-surface-variant hover:text-primary transition-colors text-caption font-inter">
                Email
              </a>
            )}
          </div>
          <p className="text-caption font-inter text-on-surface-variant">
            © {new Date().getFullYear()} {name}. Handcrafted Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
