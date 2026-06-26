export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:   'bg-surface-container-highest text-on-surface-variant',
    primary:   'bg-primary/10 text-primary',
    success:   'bg-green-100 text-green-700',
    warning:   'bg-yellow-100 text-yellow-700',
    error:     'bg-red-100 text-red-700',
    available: 'bg-green-100 text-green-700',
    sold:      'bg-red-100 text-red-700',
    hold:      'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-sm py-[2px] rounded-full font-inter text-caption font-semibold ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
