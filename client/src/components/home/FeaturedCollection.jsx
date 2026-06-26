import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { productsApi } from '../../api/products.api.js';
import ProductCard from '../products/ProductCard.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function FeaturedCollection() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured().then((d) => d.data),
  });

  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface" id="collections">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-xxl reveal">
          <div>
            <span className="text-primary font-inter text-label-md tracking-widest mb-sm block uppercase">
              Exquisite Curation
            </span>
            <h2 className="font-playfair text-headline-lg">Featured Collection</h2>
          </div>
          <p className="text-on-surface-variant max-w-md hidden md:block font-inter text-body-md">
            Each piece is meticulously poured and cured over days, ensuring a finish that captures light and depth unlike any other medium.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-xxl"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {(data || []).slice(0, 6).map((product, i) => (
              <div key={product._id} className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-xxl">
          <Link to="/collection"
            className="flex items-center gap-sm font-inter text-label-md text-primary
                       border-b-2 border-primary pb-xs hover:opacity-70 transition-all">
            View Full Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
