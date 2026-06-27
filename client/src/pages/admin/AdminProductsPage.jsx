import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import ProductTable from '../../components/admin/ProductTable.jsx';
import ProductFormModal from '../../components/admin/ProductFormModal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { productsApi } from '../../api/products.api.js';
import { categoriesApi } from '../../api/categories.api.js';

export default function AdminProductsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 12, q: '', category: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // ── Debounced search ──────────────────────────────────────
  // BUG FIX: was using useState(() => ...) which is NOT an effect.
  // useEffect is the correct hook for side effects on state change.
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setFilters((f) => ({ ...f, q: searchInput, page: 1 })),
      400
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey        : ['admin-products', filters],
    queryFn         : () => productsApi.getAll(filters).then((d) => d),
    placeholderData : (prev) => prev,
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn : () => categoriesApi.getAll().then((d) => d.data),
  });

  const products   = data?.data       || [];
  const pagination = data?.pagination;

  const handleEdit   = (p) => { setEditProduct(p); setModalOpen(true); };
  const handleAddNew = ()  => { setEditProduct(null); setModalOpen(true); };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-xl flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-xl flex-shrink-0">
          <div>
            <h1 className="font-playfair text-headline-lg">Inventory Management</h1>
            <p className="font-inter text-body-md text-on-surface-variant">Manage your artworks and collections</p>
          </div>
          <button onClick={handleAddNew} className="btn-primary flex items-center gap-sm">
            <Plus size={20} /> Add Product
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-md mb-lg flex-shrink-0 bg-white p-sm rounded-xl ambient-shadow">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by name or description…"
              className="w-full bg-transparent border-none py-sm pl-xl pr-md font-inter text-body-md focus:ring-0 focus:outline-none"
              aria-label="Search products"
            />
          </div>
          <div className="w-px h-8 bg-outline-variant/50" />
          <div className="relative flex items-center gap-sm px-md">
            <Filter size={18} className="text-on-surface-variant" aria-hidden="true" />
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
              className="bg-transparent border-none py-sm font-inter text-body-md text-on-surface-variant focus:ring-0 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {(catData || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl ambient-shadow p-md mb-lg">
          <ProductTable products={products} isLoading={isLoading} onEdit={handleEdit} />
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center flex-shrink-0 pb-md">
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              onPage={(pg) => setFilters((f) => ({ ...f, page: pg }))}
            />
          </div>
        )}
      </main>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editProduct}
      />
    </div>
  );
}
