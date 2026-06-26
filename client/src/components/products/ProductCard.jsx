import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ProductCard({ product }) {
  const img   = product?.images?.[0]?.url || product?.thumbnail;
  const price = product?.price ? `$${product.price.toLocaleString()}` : '';
  const cat   = product?.category?.name || '';

  return (
    <div className="product-card group flex flex-col cursor-pointer">
      <Link to={`/collection/${product._id}`}>
        <div className="relative overflow-hidden rounded-xl aspect-square mb-md ambient-shadow
                        transition-all group-hover:shadow-ambient-lg">
          {img ? (
            <img src={img} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              <span className="text-on-surface-variant/30 font-inter text-caption">No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {/* Available badge */}
          {product.available !== undefined && (
            <div className={`absolute top-md right-md glass-card px-sm py-[2px] rounded-lg
                             font-inter text-caption font-semibold uppercase tracking-tighter
                             ${product.available ? 'text-green-700' : 'text-red-700'}`}>
              {product.available ? 'Available' : 'Sold Out'}
            </div>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            {cat && (
              <span className="text-primary font-inter text-caption uppercase tracking-tighter">
                {cat}
              </span>
            )}
            <h3 className="font-playfair text-headline-md mt-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.dimensions && (
              <p className="font-inter text-caption text-on-surface-variant mt-xs">{product.dimensions}</p>
            )}
          </div>
          {price && (
            <span className="font-inter font-semibold text-label-md text-primary whitespace-nowrap ml-sm">
              {price}
            </span>
          )}
        </div>

        <button className="mt-md font-inter text-label-md text-on-surface-variant
                           hover:text-primary transition-colors flex items-center gap-xs">
          View Details <ArrowRight size={16} />
        </button>
      </Link>
    </div>
  );
}
