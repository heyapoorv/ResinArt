/**
 * components/admin/ProductFormModal.jsx
 *
 * Improvements:
 *  - Image preview grid when new files are selected (FileReader API)
 *  - Shows count of existing images on edit
 *  - Clearer image section layout
 */

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/products.api.js';
import { categoriesApi } from '../../api/categories.api.js';
import Modal from '../ui/Modal.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ProductFormModal({ open, onClose, product }) {
  const isEditing   = !!product;
  const queryClient = useQueryClient();
  const [previewUrls, setPreviewUrls] = useState([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn : () => categoriesApi.getAll().then((d) => d.data),
  });
  const categories = catData || [];

  useEffect(() => {
    if (open) {
      setPreviewUrls([]);
      if (product) {
        reset({
          name       : product.name,
          description: product.description,
          price      : product.price,
          category   : product.category?._id || product.category,
          featured   : product.featured,
          available  : product.available,
          dimensions : product.dimensions || '',
          sku        : product.sku || '',
        });
      } else {
        reset({ featured: false, available: true });
      }
    }
  }, [product, open, reset]);

  // Generate local previews when files are selected
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) { setPreviewUrls([]); return; }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    // Cleanup object URLs on next change or unmount
    return () => urls.forEach(URL.revokeObjectURL);
  }, []);

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

        {/* Row 1: Name + Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">
              Product Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              placeholder="Celestial Geode Wall Art"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors"
              aria-required="true"
            />
            {errors.name && <span className="text-caption text-error">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">
              Price (USD) *
            </label>
            <input
              {...register('price', { required: 'Price is required', valueAsNumber: true, min: 0 })}
              type="number" step="0.01" placeholder="520"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors"
              aria-required="true"
            />
            {errors.price && <span className="text-caption text-error">{errors.price.message}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-xs">
          <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3} placeholder="Describe the artwork…"
            className="border border-outline-variant rounded-xl bg-transparent p-md font-inter text-body-md focus:border-primary focus:outline-none transition-colors resize-none"
            aria-required="true"
          />
          {errors.description && <span className="text-caption text-error">{errors.description.message}</span>}
        </div>

        {/* Row 2: Category, Dimensions, SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors"
              aria-required="true"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <span className="text-caption text-error">{errors.category.message}</span>}
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">
              Dimensions
            </label>
            <input
              {...register('dimensions')} placeholder="60cm Diameter"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">SKU</label>
            <input
              {...register('sku')} placeholder="AR-GD-001"
              className="border-b border-outline-variant bg-transparent py-sm font-inter text-body-md focus:border-primary focus:outline-none transition-colors"
            />
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

        {/* Image upload with preview */}
        <div className="flex flex-col gap-sm">
          <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">
            Images (up to 10)
          </label>
          <label className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center
                            gap-sm cursor-pointer hover:border-primary transition-colors group">
            <Upload size={24} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
            <span className="font-inter text-label-md text-on-surface-variant">Click to upload images</span>
            <span className="font-inter text-caption text-on-surface-variant/50">JPG, PNG, WebP – Max 10MB each</span>
            <input
              {...register('images')}
              type="file" multiple accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* New file previews */}
          {previewUrls.length > 0 && (
            <div>
              <p className="font-inter text-caption text-on-surface-variant mb-sm">
                {previewUrls.length} new image(s) selected:
              </p>
              <div className="flex gap-sm flex-wrap">
                {previewUrls.map((url, i) => (
                  <img
                    key={i} src={url} alt={`Preview ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-outline-variant"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Existing images on edit */}
          {isEditing && product?.images?.length > 0 && (
            <div>
              <p className="font-inter text-caption text-on-surface-variant mb-sm">
                <ImageIcon size={12} className="inline mr-xs" />
                {product.images.length} existing image(s):
              </p>
              <div className="flex gap-sm flex-wrap">
                {product.images.map((img) => (
                  <img
                    key={img.publicId} src={img.url} alt=""
                    className="w-16 h-16 rounded-lg object-cover border border-outline-variant"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-md pt-md border-t border-outline-variant/30">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary flex items-center gap-sm disabled:opacity-60"
          >
            {mutation.isPending && <Spinner size="sm" />}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
