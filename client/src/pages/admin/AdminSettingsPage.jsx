import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Upload } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { settingsApi } from '../../api/settings.api.js';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((d) => d.data),
  });

  useEffect(() => {
    if (data) {
      reset({
        businessName: data.businessName,
        heroTitle:    data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        about:        data.about,
        whatsapp:     data.whatsapp,
        email:        data.email,
        instagram:    data.instagram,
        facebook:     data.facebook,
        address:      data.address,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (fd) => settingsApi.update(fd),
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => toast.error(e.message || 'Failed to update settings'),
  });

  const onSubmit = (formData) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'logo') {
        if (v && v.length) fd.append('logo', v[0]);
      } else if (v) {
        fd.append(k, v);
      }
    });
    mutation.mutate(fd);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-xl">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1 className="font-playfair text-headline-lg">Website Settings</h1>
            <p className="font-inter text-body-md text-on-surface-variant">Update brand identity and contact information</p>
          </div>
          <button onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}
            className="btn-primary flex items-center gap-sm">
            {mutation.isPending ? <Spinner size="sm" /> : <Save size={20} />} Save Changes
          </button>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-2 gap-gutter max-w-6xl">
          {/* Brand Info */}
          <div className="bg-white rounded-xl ambient-shadow p-xl space-y-lg">
            <h2 className="font-playfair text-headline-md border-b border-outline-variant pb-sm">Brand Identity</h2>
            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Business Name</label>
              <input {...register('businessName')} className="border-b border-outline-variant py-sm focus:border-primary focus:outline-none" />
            </div>
            
            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Logo</label>
              <div className="flex items-center gap-md mt-sm">
                {data?.logo?.url ? (
                  <img src={data.logo.url} alt="Logo" className="w-16 h-16 object-contain border border-outline-variant rounded-lg p-sm" />
                ) : (
                  <div className="w-16 h-16 bg-surface-container-high rounded-lg flex items-center justify-center text-caption text-on-surface-variant">No Logo</div>
                )}
                <label className="cursor-pointer border border-outline-variant px-md py-sm rounded-lg hover:border-primary transition-colors flex items-center gap-xs">
                  <Upload size={16} /> Change Logo
                  <input {...register('logo')} type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Hero Title (Home Page H1)</label>
              <textarea {...register('heroTitle')} rows={2} className="border border-outline-variant rounded-xl p-md focus:border-primary focus:outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Hero Subtitle</label>
              <textarea {...register('heroSubtitle')} rows={3} className="border border-outline-variant rounded-xl p-md focus:border-primary focus:outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">About Section Text</label>
              <textarea {...register('about')} rows={4} className="border border-outline-variant rounded-xl p-md focus:border-primary focus:outline-none resize-none" />
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-gutter">
            <div className="bg-white rounded-xl ambient-shadow p-xl space-y-lg">
              <h2 className="font-playfair text-headline-md border-b border-outline-variant pb-sm">Contact Details</h2>
              <div className="flex flex-col gap-xs">
                <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">WhatsApp Number</label>
                <input {...register('whatsapp')} placeholder="+1 (234) 567-890" className="border-b border-outline-variant py-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Email Address</label>
                <input {...register('email')} type="email" placeholder="hello@auraresin.art" className="border-b border-outline-variant py-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Studio Address</label>
                <textarea {...register('address')} rows={2} className="border border-outline-variant rounded-xl p-md focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>

            <div className="bg-white rounded-xl ambient-shadow p-xl space-y-lg">
              <h2 className="font-playfair text-headline-md border-b border-outline-variant pb-sm">Social Links</h2>
              <div className="flex flex-col gap-xs">
                <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Instagram URL</label>
                <input {...register('instagram')} type="url" placeholder="https://instagram.com/..." className="border-b border-outline-variant py-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-inter text-caption uppercase tracking-widest text-on-surface-variant">Facebook URL</label>
                <input {...register('facebook')} type="url" placeholder="https://facebook.com/..." className="border-b border-outline-variant py-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
