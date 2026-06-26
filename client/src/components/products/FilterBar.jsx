import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories.api.js';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'featured',   label: 'Curated Favorites' },
];

export default function FilterBar({ filters, onChange }) {
  const [search, setSearch] = useState(filters.q || '');

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((d) => d.data),
  });
  const categories = catData || [];

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => onChange({ ...filters, q: search, page: 1 }), 400);
    return () => clearTimeout(t);
  }, [search]);

  const setCategory = (catId) =>
    onChange({ ...filters, category: catId === filters.category ? '' : catId, page: 1 });

  const setSort = (sort) => onChange({ ...filters, sort, page: 1 });

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-xl border-b border-outline-variant/30
                        sticky top-20 bg-background z-40 transition-shadow">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-lg">

        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artworks…"
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-sm px-0
                       font-inter text-body-md focus:border-primary focus:outline-none transition-colors
                       placeholder:text-on-surface-variant/40" />
          <Search size={18}
            className="absolute right-0 top-2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-sm">
          <button onClick={() => setCategory('')}
            className={`px-lg py-sm rounded-full font-inter text-label-md transition-all
              ${!filters.category ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
            All Artworks
          </button>
          {categories.filter((c) => c.productCount > 0).slice(0, 6).map((c) => (
            <button key={c._id} onClick={() => setCategory(c._id)}
              className={`px-lg py-sm rounded-full font-inter text-label-md transition-all
                ${filters.category === c._id ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-sm border-b border-outline-variant py-xs">
          <span className="font-inter text-caption text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
            Sort By:
          </span>
          <select value={filters.sort || 'newest'} onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border-none font-inter text-label-md focus:ring-0 cursor-pointer text-on-surface">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
