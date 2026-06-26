import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I place a custom order?',
    a: 'Simply contact us via WhatsApp or our Contact form. We\'ll discuss your color preferences, size requirements, and budget before providing a custom quote.',
  },
  {
    q: 'What is the shipping timeframe?',
    a: 'Ready-to-ship items are dispatched within 2–3 business days. Custom pieces typically take 2–3 weeks for pouring, curing, and finishing processes.',
  },
  {
    q: 'How do I care for my resin art?',
    a: 'Resin is durable but should be kept out of direct sunlight to prevent yellowing over time. Clean with a soft, damp microfiber cloth. Avoid harsh chemicals.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes! We offer worldwide shipping. All pieces are custom-crated for secure international transit. Contact us for a shipping quote to your location.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl ambient-shadow overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-lg cursor-pointer font-inter font-semibold text-label-md text-on-surface text-left">
        {q}
        <ChevronDown size={20}
          className={`text-on-surface-variant transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48' : 'max-h-0'}`}>
        <div className="px-lg pb-lg font-inter text-body-md text-on-surface-variant">{a}</div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-3xl mx-auto reveal">
        <h2 className="font-playfair text-headline-lg text-center mb-xxl">
          Frequently Asked Questions
        </h2>
        <div className="space-y-sm">
          {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </div>
    </section>
  );
}
