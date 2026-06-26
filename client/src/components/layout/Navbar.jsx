import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api.js';

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((d) => d.data),
    staleTime: Infinity,
  });
  const businessName = data?.businessName || 'AURA RESIN';
  const whatsapp     = data?.whatsapp     || '';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Gallery',     href: '/#gallery' },
    { label: 'Collections', href: '/collection' },
    { label: 'Process',     href: '/#process' },
    { label: 'About',       href: '/#about' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 h-20 flex items-center justify-between
      px-margin-mobile md:px-margin-desktop transition-all duration-300
      ${scrolled ? 'glass-nav shadow-lg' : 'bg-transparent'}`}>

      {/* Brand */}
      <Link to="/"
        className="font-playfair text-headline-md tracking-tight text-primary font-bold hover:opacity-80 transition-opacity">
        {businessName}
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-lg items-center">
        {navLinks.map((l) => (
          <a key={l.label} href={l.href}
            className="nav-link font-inter text-label-md text-on-surface-variant hover:text-primary transition-colors">
            {l.label}
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-md">
        <button onClick={() => setSearchOpen(!searchOpen)}
          className="hidden md:flex text-on-surface-variant hover:text-primary transition-colors">
          <Search size={20} />
        </button>

        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
            className="btn-primary text-sm hidden md:inline-flex items-center gap-xs">
            Contact Us
          </a>
        )}
        {!whatsapp && (
          <Link to="/collection" className="btn-primary text-sm hidden md:inline-flex">
            Contact Us
          </Link>
        )}

        <button className="md:hidden text-on-surface-variant" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 w-full glass-card px-margin-mobile py-lg flex flex-col gap-md md:hidden">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
              className="font-inter text-body-md text-on-surface hover:text-primary transition-colors py-sm border-b border-outline-variant/30 last:border-0">
              {l.label}
            </a>
          ))}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              className="btn-primary text-center mt-sm">Contact Us</a>
          )}
        </div>
      )}
    </nav>
  );
}
