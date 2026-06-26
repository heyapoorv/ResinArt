import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Mail, Ruler } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/products/ProductCard.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { productsApi } from '../../api/products.api.js';
import { settingsApi } from '../../api/settings.api.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id).then((r) => r.data),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((d) => d.data),
    staleTime: Infinity,
  });

  const product = data?.product;
  const related = data?.related || [];
  const whatsapp = settings?.whatsapp || '';
  const email    = settings?.email    || '';

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center"><Spinner size="lg" /></div>
  );

  if (isError || !product) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-md">
      <p className="font-playfair text-headline-lg opacity-40">Product not found</p>
      <Link to="/collection" className="btn-primary">Back to Collection</Link>
    </div>
  );

  const images = product.images || [];
  const whatsappMsg = `Hi! I'm interested in "${product.name}" (Price: $${product.price}). Is it available?`;

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="pt-28 pb-xxl px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors mb-xl font-inter text-label-md">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xxl items-start">

          {/* ── Image Gallery ─────────────────────── */}
          <div className="flex flex-col gap-md">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-high ambient-shadow">
              {images.length > 0 ? (
                <>
                  <img src={images[activeImg]?.url} alt={product.name}
                    className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={prevImg}
                        className="absolute left-md top-1/2 -translate-y-1/2 glass-card p-sm rounded-full hover:opacity-80">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextImg}
                        className="absolute right-md top-1/2 -translate-y-1/2 glass-card p-sm rounded-full hover:opacity-80">
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                  No image
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-sm overflow-x-auto pb-sm">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all
                      ${activeImg === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ───────────────────────── */}
          <div className="flex flex-col gap-lg">
            {/* Category & Status */}
            <div className="flex items-center gap-sm flex-wrap">
              {product.category?.name && (
                <Link to={`/collection?category=${product.category._id}&name=${encodeURIComponent(product.category.name)}`}
                  className="text-primary font-inter text-label-md uppercase tracking-tighter hover:opacity-70">
                  {product.category.name}
                </Link>
              )}
              <Badge variant={product.available ? 'available' : 'sold'}>
                {product.available ? 'Available' : 'Sold Out'}
              </Badge>
              {product.featured && (
                <Badge variant="primary">✦ Featured</Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="font-playfair text-display-lg leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="text-headline-lg font-inter font-bold text-primary">
              ${product.price?.toLocaleString()}
            </div>

            {/* Description */}
            <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
              {product.description}
            </p>

            {/* Specs */}
            {(product.dimensions || product.sku) && (
              <div className="bg-surface-container-low rounded-xl p-lg grid grid-cols-2 gap-md">
                {product.dimensions && (
                  <div>
                    <div className="flex items-center gap-xs text-caption text-on-surface-variant mb-xs uppercase tracking-widest">
                      <Ruler size={12} /> Dimensions
                    </div>
                    <p className="font-inter text-body-md">{product.dimensions}</p>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <p className="text-caption text-on-surface-variant mb-xs uppercase tracking-widest">SKU</p>
                    <p className="font-inter text-body-md font-semibold">{product.sku}</p>
                  </div>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-md pt-md">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank" rel="noreferrer"
                  className="btn-primary flex items-center justify-center gap-sm">
                  <MessageCircle size={18} />
                  Order on WhatsApp
                </a>
              )}
              {email && (
                <a href={`mailto:${email}?subject=Inquiry: ${encodeURIComponent(product.name)}&body=${encodeURIComponent(whatsappMsg)}`}
                  className="btn-ghost flex items-center justify-center gap-sm">
                  <Mail size={18} />
                  Inquire via Email
                </a>
              )}
            </div>

            {/* Care accordion */}
            <details className="group border-t border-outline-variant pt-md cursor-pointer">
              <summary className="flex justify-between items-center font-inter font-semibold text-label-md list-none">
                Artisan Care Instructions
                <span className="text-on-surface-variant group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <ul className="mt-md space-y-sm text-on-surface-variant font-inter text-body-md list-disc pl-md">
                <li>Avoid prolonged direct sunlight to prevent yellowing</li>
                <li>Clean with a soft microfiber cloth, lightly dampened</li>
                <li>Avoid harsh chemical cleaners or abrasives</li>
                <li>Store away from extreme temperatures or humidity</li>
              </ul>
            </details>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-xxl pt-xxl border-t border-outline-variant/30">
            <h2 className="font-playfair text-headline-lg mb-xl">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
