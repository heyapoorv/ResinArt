export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) {
  const colors = {
    primary:   'bg-primary/10 text-primary',
    gold:      'bg-primary-container/40 text-primary',
    success:   'bg-green-100 text-green-700',
    warning:   'bg-yellow-100 text-yellow-700',
  };
  return (
    <div className="bg-white rounded-xl p-lg ambient-shadow flex items-start gap-lg">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div>
        <p className="font-inter text-caption text-on-surface-variant uppercase tracking-widest">{title}</p>
        <p className="font-playfair text-display-lg text-on-surface mt-xs leading-none">{value}</p>
        {subtitle && (
          <p className="font-inter text-caption text-on-surface-variant mt-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
