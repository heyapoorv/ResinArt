/**
 * components/ui/PageSkeleton.jsx
 *
 * Skeleton loader for product grids and cards.
 * Used in ProductsPage and FeaturedCollection during initial load.
 */

import { memo } from 'react';

/** Single animated skeleton product card */
const ProductCardSkeleton = memo(() => (
  <div className="bg-surface-container-low rounded-2xl overflow-hidden animate-pulse">
    {/* Image area */}
    <div className="aspect-square bg-surface-container-high" />
    {/* Content */}
    <div className="p-lg space-y-sm">
      <div className="h-3 bg-surface-container-high rounded w-1/3" />
      <div className="h-5 bg-surface-container-high rounded w-3/4" />
      <div className="h-4 bg-surface-container-high rounded w-1/2 mt-md" />
    </div>
  </div>
));
ProductCardSkeleton.displayName = 'ProductCardSkeleton';

/**
 * A grid of skeleton product cards.
 * @param {number} count - number of skeleton cards to render
 */
const ProductGridSkeleton = memo(({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
));
ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export { ProductCardSkeleton, ProductGridSkeleton };
export default ProductGridSkeleton;
