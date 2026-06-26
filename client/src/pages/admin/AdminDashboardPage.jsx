import { useQuery } from '@tanstack/react-query';
import { Package, Star, Tag, Eye } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import StatsCard from '../../components/admin/StatsCard.jsx';
import { productsApi } from '../../api/products.api.js';
import { categoriesApi } from '../../api/categories.api.js';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { data: stats }   = useQuery({ queryKey: ['product-stats'],  queryFn: () => productsApi.getStats().then((d) => d.data) });
  const { data: catData } = useQuery({ queryKey: ['categories'],     queryFn: () => categoriesApi.getAll().then((d) => d.data) });
  const { data: featured } = useQuery({
    queryKey: ['admin-recent'],
    queryFn: () => productsApi.getAll({ sort: 'newest', limit: 5 }).then((d) => d.data),
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-xl overflow-y-auto">
        {/* Header */}
        <div className="mb-xl">
          <h1 className="font-playfair text-headline-lg">Studio Overview</h1>
          <p className="font-inter text-body-md text-on-surface-variant">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xxl">
          <StatsCard title="Total Artworks"  value={stats?.total        ?? '—'} icon={Package}  color="primary"  />
          <StatsCard title="Featured"        value={stats?.featured     ?? '—'} icon={Star}     color="gold"     />
          <StatsCard title="Available"       value={stats?.available    ?? '—'} icon={Eye}      color="success"  />
          <StatsCard title="Categories"      value={catData?.length     ?? '—'} icon={Tag}      color="warning"  />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-xxl">
          {/* Recent products */}
          <div className="bg-white rounded-xl ambient-shadow p-lg">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-playfair text-headline-md">Recent Artworks</h2>
              <Link to="/admin/products" className="text-primary font-inter text-label-md hover:opacity-70">View All</Link>
            </div>
            <div className="space-y-md divide-y divide-outline-variant/20">
              {(featured || []).map((p) => (
                <div key={p._id} className="flex items-center gap-md pt-md first:pt-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high">
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-sm truncate">{p.name}</p>
                    <p className="font-inter text-caption text-on-surface-variant">{p.category?.name || '—'}</p>
                  </div>
                  <span className="font-inter font-bold text-primary text-sm">${p.price?.toLocaleString()}</span>
                </div>
              ))}
              {!featured?.length && (
                <p className="font-inter text-caption text-on-surface-variant py-md text-center">No products yet.</p>
              )}
            </div>
          </div>

          {/* Categories breakdown */}
          <div className="bg-white rounded-xl ambient-shadow p-lg">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-playfair text-headline-md">Categories</h2>
              <Link to="/admin/categories" className="text-primary font-inter text-label-md hover:opacity-70">Manage</Link>
            </div>
            <div className="space-y-md divide-y divide-outline-variant/20">
              {(catData || []).slice(0, 6).map((cat) => (
                <div key={cat._id} className="flex items-center justify-between pt-md first:pt-0">
                  <span className="font-inter text-body-md">{cat.name}</span>
                  <span className={`font-inter text-caption font-semibold px-sm py-[2px] rounded-full
                    ${cat.productCount > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {cat.productCount} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
