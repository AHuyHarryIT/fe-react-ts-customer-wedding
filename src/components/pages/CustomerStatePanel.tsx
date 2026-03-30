import { AlertCircle, CheckCircle2, Info, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

type CustomerStateTone = 'loading' | 'empty' | 'error' | 'success' | 'info';

interface CustomerStatePanelProps {
  tone?: CustomerStateTone;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const toneStyles: Record<
  CustomerStateTone,
  {
    panel: string;
    badge: string;
    icon: ReactNode;
  }
> = {
  loading: {
    panel: 'border-rose-100 bg-white/95',
    badge: 'bg-rose-50 text-rose-600',
    icon: <Loader2 className="size-5 animate-spin" />,
  },
  empty: {
    panel: 'border-rose-100 bg-rose-50/60',
    badge: 'bg-rose-100 text-rose-600',
    icon: <Inbox className="size-5" />,
  },
  error: {
    panel: 'border-red-100 bg-red-50/70',
    badge: 'bg-red-100 text-red-600',
    icon: <AlertCircle className="size-5" />,
  },
  success: {
    panel: 'border-emerald-100 bg-emerald-50/70',
    badge: 'bg-emerald-100 text-emerald-600',
    icon: <CheckCircle2 className="size-5" />,
  },
  info: {
    panel: 'border-slate-100 bg-white/95',
    badge: 'bg-slate-100 text-slate-600',
    icon: <Info className="size-5" />,
  },
};

export function CustomerStatePanel({
  tone = 'info',
  eyebrow,
  title,
  description,
  actions,
  children,
  className = '',
}: CustomerStatePanelProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-[28px] border p-6 shadow-sm backdrop-blur-sm ${styles.panel} ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-2xl p-3 ${styles.badge}`}>{styles.icon}</div>
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-medium text-gray-900">{title}</h2>
          {description ? (
            <div className="mt-2 text-sm leading-6 text-gray-600">{description}</div>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
      {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </div>
  );
}
