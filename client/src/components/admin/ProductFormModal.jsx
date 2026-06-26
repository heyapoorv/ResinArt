import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/products.api.js';
import { categoriesApi } from '../../api/categories.api.js';
import Modal from '../ui/Modal.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ProductFormModal({ open, onClose, product }) {
  const isEditing   = !!product;
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((d) => d.data),
  });
  const categories = catData || [];

  useEffect(() => {
    if (product) {
      reset({
        name:        product.name,
        description: product.description,
        price:       product.price,
        category:    product.category?._id || product.category,
        featured:    product.featured,
        available:   product.available,
        dimensions:  product.dimensions || '',
        sku:         product.sku || '',
      });
    } else {
      reset({ featured: false, available: true });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (fd) => isEditing
      ? productsApi.update(product._id, fd)
      : productsApi.create(fd),
    onSuccess: () => {
      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      onClose();
    },
    onError: (e) => toast.error(e.message || 'Something went wrong.'),
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'images') {
        // files array
        if (v && v.length) [...v].forEach((f) => fd.append('images', f));
      } else if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    });
    mutation.mutate(fd);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Product' : 'Add New Product'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Product Name *</label>
            <input {...register('name', { required: 'Name is required' })}
              placeholder="Celestial Geode Wall Art"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors" />
            {errors.name && <span className="text-caption text-error">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Price (USD) *</label>
            <input {...register('price', { required: 'Price is required', valueAsNumber: true, min: 0 })}
              type="number" step="0.01" placeholder="520"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors" />
            {errors.price && <span className="text-caption text-error">{errors.price.message}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-xs">
          <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Description *</label>
          <textarea {...register('description', { required: 'Description is required' })}
            rows={3} placeholder="Describe the artwork…"
            className="border border-outline-variant rounded-xl bg-transparent p-md font-inter text-body-md
                       focus:border-primary focus:outline-none transition-colors resize-none" />
          {errors.description && <span className="text-caption text-error">{errors.description.message}</span>}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Category *</label>
            <select {...register('category', { required: 'Category is required' })}
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors">
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <span className="text-caption text-error">{errors.category.message}</span>}
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Dimensions</label>
            <input {...register('dimensions')} placeholder="60cm Diameter"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">SKU</label>
            <input {...register('sku')} placeholder="AR-GD-001"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors" />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-xl">
          <label className="flex items-center gap-sm cursor-pointer">
            <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-primary" />
            <span className="font-inter text-body-md">Featured</span>
          </label>
          <label className="flex items-center gap-sm cursor-pointer">
            <input type="checkbox" {...register('available')} className="w-4 h-4 accent-primary" />
            <span className="font-inter text-body-md">Available</span>
          </label>
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-xs">
          <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Images (up to 10)</label>
          <label className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center
                            gap-sm cursor-pointer hover:border-primary transition-colors group">
            <Upload size={24} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
            <span className="font-inter text-label-md text-on-surface-variant">Click to upload images</span>
            <span className="font-inter text-caption text-on-surface-variant/50">JPG, PNG, WebP – Max 10MB each</span>
            <input {...register('images')} type="file" multiple accept="image/*" className="hidden" />
          </label>
          {isEditing && product?.images?.length > 0 && (
            <div className="flex gap-sm mt-sm flex-wrap">
              {product.images.slice(0, 5).map((img) => (
                <img key={img.publicId} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-md pt-md border-t border-outline-variant/30">
          <button type="button" onClick={onClose}
            className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending}
            className="btn-primary flex items-center gap-sm disabled:opacity-60">
            {mutation.isPending && <Spinner size="sm" />}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
