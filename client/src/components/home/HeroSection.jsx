import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api.js';

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHcDRQftQmLuwxO6oJWm-VP545WPCV8aeK28fuH-dqXQAnHeKcAvdHAMjrTgBiAyR4V0VqzMTjsI69X3J3zfpD13yJo_zXdHInDux597mGB8LpJQBvCvFLjNLN5jo0Q7pYuYMimbCcKvm3gRGCt-f6G3KuAFrG6zYJLYncZ8EBhLk535VOYvHLDJTnRLXEPLQcG2NhT4klELvJGYscS2b78J7SuRkit-Smson02IRQgBLNjkc4BDcR2gXEALtSdQB4D3iuNGI8BJ6s';

export default function HeroSection() {
  const bgRef = useRef(null);
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((d) => d.data),
    staleTime: Infinity,
  });

  const title    = data?.heroTitle    || 'Handcrafted Resin Art That Makes Every Space Unique';
  const subtitle = data?.heroSubtitle || 'Discover the fusion of nature and artistry. Each piece is a unique story told in glass-like resin.';
  const whatsapp = data?.whatsapp     || '';

  // Parallax
  useEffect(() => {
    const handler = () => {
      if (bgRef.current)
        bgRef.current.style.transform = `translateY(${window.pageYOffset * 0.3}px) scale(1.05)`;
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div ref={bgRef}
          className="w-full h-full bg-cover bg-center scale-105 transition-transform duration-[10s]"
          style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-margin-mobile max-w-4xl animate-fade-up">
        <h1 className="font-playfair text-display-lg text-white mb-lg leading-tight">
          {title}
        </h1>
        <p className="font-inter text-body-lg text-white/90 mb-xl max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col md:flex-row gap-md justify-center items-center">
          <Link to="/collection"
            className="w-full md:w-auto bg-primary text-on-primary px-xxl py-md rounded-full
                       font-inter font-semibold text-label-md hover:opacity-90 transition-all ambient-shadow">
            Browse Collection
          </Link>
          {whatsapp ? (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank" rel="noreferrer"
              className="w-full md:w-auto glass-card text-white px-xxl py-md rounded-full
                         font-inter font-semibold text-label-md hover:bg-white/20 transition-all border border-white/40">
              Contact on WhatsApp
            </a>
          ) : (
            <a href="#about"
              className="w-full md:w-auto glass-card text-white px-xxl py-md rounded-full
                         font-inter font-semibold text-label-md hover:bg-white/20 transition-all border border-white/40">
              Learn More
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-float">
        <span className="font-inter text-caption uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-white/40" />
      </div>
    </section>
  );
}
