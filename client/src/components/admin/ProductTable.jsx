import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Star, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/products.api.js';
import Badge from '../ui/Badge.jsx';

export default function ProductTable({ products = [], onEdit, isLoading }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      setConfirmDelete(null);
    },
    onError: (e) => toast.error(e.message || 'Delete failed.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, featured }) => {
      const fd = new FormData();
      fd.append('featured', String(!featured));
      return productsApi.update(id, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Featured status updated.');
    },
    onError: (e) => toast.error(e.message || 'Update failed.'),
  });

  if (isLoading) return (
    <div className="space-y-md">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-surface-container-high rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (!products.length) return (
    <div className="flex flex-col items-center py-xxl text-on-surface-variant/50 gap-md">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
        <Star size={24} className="opacity-30" />
      </div>
      <p className="font-inter text-body-md">No products found.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
      <table className="w-full font-inter text-sm">
        <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
          <tr>
            {['Product', 'Category', 'Price', 'Featured', 'Status', 'Actions'].map((h) => (
              <th key={h} className="text-left px-lg py-md first:rounded-tl-xl last:rounded-tr-xl
                                    uppercase tracking-widest text-caption">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {products.map((p) => (
            <tr key={p._id} className="bg-white hover:bg-surface-container-lowest transition-colors">
              {/* Product */}
              <td className="px-lg py-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-caption text-on-surface-variant/30">?</div>
                    )}
                  </div>
                  <div className="max-w-[200px]">
                    <p className="font-semibold truncate">{p.name}</p>
                    {p.sku && <p className="text-caption text-on-surface-variant truncate">SKU: {p.sku}</p>}
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-lg py-md text-on-surface-variant">{p.category?.name || '—'}</td>

              {/* Price */}
              <td className="px-lg py-md font-semibold text-primary">${p.price?.toLocaleString()}</td>

              {/* Featured toggle */}
              <td className="px-lg py-md">
                <button
                  onClick={() => toggleMutation.mutate({ id: p._id, featured: p.featured })}
                  disabled={toggleMutation.isPending}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                    ${p.featured
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10'}`}>
                  <Star size={14} fill={p.featured ? 'currentColor' : 'none'} />
                </button>
              </td>

              {/* Status */}
              <td className="px-lg py-md">
                <Badge variant={p.available ? 'available' : 'sold'}>
                  {p.available ? 'Available' : 'Sold'}
                </Badge>
              </td>

              {/* Actions */}
              <td className="px-lg py-md">
                {confirmDelete === p._id ? (
                  <div className="flex items-center gap-sm">
                    <span className="text-caption text-error">Delete?</span>
                    <button onClick={() => deleteMutation.mutate(p._id)} disabled={deleteMutation.isPending}
                      className="text-error hover:opacity-70">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="text-on-surface-variant hover:text-error">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-sm">
                    <button onClick={() => onEdit(p)}
                      className="p-sm rounded-lg text-on-surface-variant hover:text-primary
                                 hover:bg-primary/10 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setConfirmDelete(p._id)}
                      className="p-sm rounded-lg text-on-surface-variant hover:text-error
                                 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
