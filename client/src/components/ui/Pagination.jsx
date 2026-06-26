import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const arr = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) arr.push(i);
      else if (arr[arr.length - 1] !== '...') arr.push('...');
    }
    return arr;
  };

  return (
    <div className="flex items-center gap-xs">
      <button
        onClick={() => onPage(page - 1)} disabled={page <= 1}
        className="w-10 h-10 rounded-lg flex items-center justify-center
                   text-on-surface-variant hover:bg-surface-container-highest
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={20} />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-sm text-on-surface-variant/40 font-inter text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)}
            className={`w-10 h-10 rounded-lg font-inter text-label-md transition-colors
              ${p === page
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)} disabled={page >= pages}
        className="w-10 h-10 rounded-lg flex items-center justify-center
                   text-on-surface-variant hover:bg-surface-container-highest
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
