import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import FilterBar from '../../components/products/FilterBar.jsx';
import ProductCard from '../../components/products/ProductCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
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
  }, [filters]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters).then((r) => r),
    keepPreviousData: true,
  });

  const products   = data?.data   || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-background min-h-screen">
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
          <div className="flex justify-center py-xxl"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="text-center py-xxl text-on-surface-variant font-inter">
            Failed to load products. Make sure the backend is running.
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

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mt-xxl">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPage={(pg) => setFilters((f) => ({ ...f, page: pg }))} />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
