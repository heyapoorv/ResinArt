import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { categoriesApi } from '../../api/categories.api.js';

function CategoryFormModal({ open, onClose, category }) {
  const isEditing = !!category;
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useState(() => {
    if (category) {
      reset({ name: category.name, description: category.description, icon: category.icon });
    } else {
      reset({ name: '', description: '', icon: '' });
    }
  }, [category, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? categoriesApi.update(category._id, data) : categoriesApi.create(data),
    onSuccess: () => {
      toast.success(isEditing ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    },
    onError: (e) => toast.error(e.message || 'Action failed'),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Category' : 'New Category'} size="sm">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-md">
        <div className="flex flex-col gap-xs">
          <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Name *</label>
          <input {...register('name', { required: 'Name is required' })}
            className="border-b border-outline-variant py-sm focus:border-primary focus:outline-none transition-colors" />
          {errors.name && <span className="text-error text-caption">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Description</label>
          <textarea {...register('description')} rows={3}
            className="border border-outline-variant rounded-xl p-md focus:border-primary focus:outline-none transition-colors resize-none" />
        </div>
        <div className="flex justify-end gap-md pt-md">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-sm">
            {mutation.isPending && <Spinner size="sm" />} Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((d) => d.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e) => toast.error(e.message || 'Cannot delete category'),
  });

  const handleEdit = (c) => { setEditCat(c); setModalOpen(true); };
  const handleAdd = () => { setEditCat(null); setModalOpen(true); };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-xl">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1 className="font-playfair text-headline-lg">Categories</h1>
            <p className="font-inter text-body-md text-on-surface-variant">Manage product categories</p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-sm">
            <Plus size={20} /> Add Category
          </button>
        </div>

        <div className="bg-white rounded-xl ambient-shadow overflow-hidden border border-outline-variant/30">
          <table className="w-full text-left font-inter text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant text-caption uppercase tracking-widest">
              <tr>
                <th className="px-lg py-md">Name</th>
                <th className="px-lg py-md">Slug</th>
                <th className="px-lg py-md">Products</th>
                <th className="px-lg py-md">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLoading ? (
                <tr><td colSpan="4" className="px-lg py-xl text-center"><Spinner className="mx-auto" /></td></tr>
              ) : categories?.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container-lowest">
                  <td className="px-lg py-md font-semibold">{c.name}</td>
                  <td className="px-lg py-md text-on-surface-variant">{c.slug}</td>
                  <td className="px-lg py-md">
                    <span className="bg-primary/10 text-primary px-sm py-[2px] rounded-full font-semibold">
                      {c.productCount}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex gap-sm">
                      <button onClick={() => handleEdit(c)} className="p-sm hover:text-primary hover:bg-primary/10 rounded-lg">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => {
                        if (confirm(`Delete category "${c.name}"?`)) deleteMutation.mutate(c._id);
                      }} className="p-sm hover:text-error hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {modalOpen && <CategoryFormModal open={modalOpen} onClose={() => setModalOpen(false)} category={editCat} />}
    </div>
  );
}
