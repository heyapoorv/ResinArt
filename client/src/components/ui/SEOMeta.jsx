/**
 * components/ui/SEOMeta.jsx
 *
 * Injects SEO metadata into <head>:
 *   - <title>
 *   - meta description
 *   - Open Graph (og:title, og:description, og:image, og:type, og:url)
 *   - Twitter Card
 *
 * Usage:
 *   <SEOMeta
 *     title="Full Collection – Aura Resin"
 *     description="Browse handcrafted resin art..."
 *     image="https://res.cloudinary.com/..."
 *   />
 */

import { useEffect } from 'react';

const SITE_NAME = 'Aura Resin';
const DEFAULT_IMAGE = ''; // set to your OG default image URL

function setMeta(name, content, property = false) {
  if (!content) return;
  const attr   = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SEOMeta({
  title,
  description,
  image  = DEFAULT_IMAGE,
  type   = 'website',
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    // Title
    document.title = fullTitle;

    // Standard meta
    setMeta('description', description);
    if (noindex) setMeta('robots', 'noindex,nofollow');

    // Open Graph
    setMeta('og:title',       fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image',       image, true);
    setMeta('og:type',        type, true);
    setMeta('og:url',         window.location.href, true);
    setMeta('og:site_name',   SITE_NAME, true);

    // Twitter Card
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image',       image);
  }, [title, description, image, type, noindex]);

  return null; // renders nothing to the DOM
}
