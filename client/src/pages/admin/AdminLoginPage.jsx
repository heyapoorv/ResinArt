import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

export default function AdminLoginPage() {
  const { login, admin } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // Already logged in?
  useEffect(() => { if (admin) navigate('/admin', { replace: true }); }, [admin]);

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-md">
      {/* Decorative gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-fixed-dim rounded-full
                        mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-fixed rounded-full
                        mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-xxl">
          <h1 className="font-playfair text-display-lg text-primary">Aura Resin</h1>
          <p className="font-inter text-body-md text-on-surface-variant mt-sm">Admin Studio</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-xl md:p-xxl ambient-shadow">
          <h2 className="font-playfair text-headline-lg mb-xl">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-xl">
            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                type="email" placeholder="admin@auraresin.art"
                className="bg-transparent border-b border-outline-variant py-sm font-inter text-body-md
                           focus:border-primary focus:outline-none transition-colors" />
              {errors.email && <span className="text-caption text-error">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">Password</label>
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                type="password" placeholder="••••••••"
                className="bg-transparent border-b border-outline-variant py-sm font-inter text-body-md
                           focus:border-primary focus:outline-none transition-colors" />
              {errors.password && <span className="text-caption text-error">{errors.password.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full py-md flex justify-center items-center gap-sm
                         disabled:opacity-60 disabled:cursor-not-allowed text-base">
              {isSubmitting ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
