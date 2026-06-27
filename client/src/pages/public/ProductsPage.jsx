import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import FilterBar from '../../components/products/FilterBar.jsx';
import ProductCard from '../../components/products/ProductCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ProductGridSkeleton from '../../components/ui/PageSkeleton.jsx';
import SEOMeta from '../../components/ui/SEOMeta.jsx';
import { productsApi } from '../../api/products.api.js';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q:        searchParams.get('q')        || '',
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort')     || 'newest',
    page:     parseInt(searchParams.get('page')) || 1,
    limit:    12,
  });

  // Sync filters → URL
  useEffect(() => {
    const p = {};
    if (filters.q)        p.q = filters.q;
    if (filters.category) p.category = filters.category;
    if (filters.sort !== 'newest') p.sort = filters.sort;
    if (filters.page > 1) p.page = filters.page;
    setSearchParams(p);
  }, [filters, setSearchParams]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey     : ['products', filters],
    queryFn      : () => productsApi.getAll(filters).then((r) => r),
    placeholderData: (prev) => prev, // keeps previous data while loading next page
  });

  const products   = data?.data   || [];
  const pagination = data?.pagination;

  const handlePage = useCallback(
    (pg) => setFilters((f) => ({ ...f, page: pg })),
    []
  );

  return (
    <div className="bg-background min-h-screen">
      <SEOMeta
        title="Full Collection"
        description="Browse our complete collection of handcrafted resin art. Filter by category, price, and more."
      />
      <Navbar />

      {/* Page header */}
      <section className="pt-32 pb-xl px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <span className="text-primary font-inter text-label-md tracking-widest block mb-sm uppercase">
            Artisan Gallery
          </span>
          <h1 className="font-playfair text-display-lg">Full Collection</h1>
          {pagination && (
            <p className="mt-sm font-inter text-body-md text-on-surface-variant">
              {pagination.total} artworks available
            </p>
          )}
        </div>
      </section>

      <FilterBar filters={filters} onChange={setFilters} />

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xxl">
        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : isError ? (
          <div className="flex flex-col items-center py-xxl text-on-surface-variant gap-lg">
            <p className="font-playfair text-headline-lg opacity-40">Failed to load products</p>
            <p className="font-inter text-body-md opacity-50">Please check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              className="btn-ghost flex items-center gap-sm"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-xxl gap-md text-on-surface-variant">
            <p className="font-playfair text-headline-lg opacity-40">No artworks found</p>
            <p className="font-inter text-body-md opacity-50">Try a different filter or search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mt-xxl">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPage={handlePage}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
