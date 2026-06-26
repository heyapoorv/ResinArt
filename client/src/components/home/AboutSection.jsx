import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api.js';

const ABOUT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuATNXM68-YoNAKdeKR0H3ns-YJOk0-HtWqCaqdZQUXqxymHQHaxxbGKbyhwcX6duHfvc96nG4u_RJeEeQ4Uov90k1zaFTxqpaK6tDcEwp00RILxexr2Ge3FQMVoJB6RXzu1sLKaSOpkmpOCcLSOiBcTKjCAcn42l6DYJXXz0CS4c9yk0-_F4tmj9DIXmmqNYQinqcxuT0A0Ws7R0C8Z96D06zBg8PTDKMfKKrfTXR_3T8fXQVCBtiJdBTybIgP7s1Wv7ZYlQksAITb3';

export default function AboutSection() {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn:  () => settingsApi.get().then((d) => d.data),
    staleTime: Infinity,
  });
  const aboutText = data?.about || 'At Aura Resin, we believe that art should be tactile. Our journey began with a fascination for the fluid beauty of resin—a material that captures motion and light in a permanent, glass-like embrace.';

  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-xxl">
        {/* Image */}
        <div className="flex-1 reveal">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-fixed-dim rounded-full
                            mix-blend-multiply filter blur-3xl opacity-20" />
            <img src={ABOUT_IMG} alt="Artisan at work"
              className="rounded-2xl w-full shadow-2xl relative z-10 object-cover" />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 reveal" style={{ transitionDelay: '200ms' }}>
          <span className="text-primary font-inter text-label-md tracking-widest mb-sm block uppercase">
            The Artisan Journey
          </span>
          <h2 className="font-playfair text-display-lg mb-lg leading-tight">
            Where Passion Meets Precision
          </h2>
          <p className="text-on-surface-variant font-inter text-body-lg mb-lg">{aboutText}</p>
          <p className="text-on-surface-variant font-inter text-body-md mb-xl">
            Every piece in our gallery is handcrafted in our boutique studio. We source only the highest-grade,
            UV-resistant resins and ethically sourced woods to ensure your art remains as vibrant as the day it was created.
          </p>
          <button className="border-b-2 border-primary text-primary font-inter font-semibold text-label-md pb-xs hover:opacity-70 transition-all">
            Read Our Story
          </button>
        </div>
      </div>
    </section>
  );
}
