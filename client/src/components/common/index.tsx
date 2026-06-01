// ─── Skeleton components ──────────────────────────────────────────────────────

export const QuestionCardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 animate-pulse">
    <div className="h-5 w-24 bg-surface-container rounded-full mb-4" />
    <div className="h-4 bg-surface-container rounded mb-2 w-full" />
    <div className="h-4 bg-surface-container rounded mb-2 w-4/5" />
    <div className="h-4 bg-surface-container rounded mb-6 w-3/5" />
    <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
      <div className="h-3 w-16 bg-surface-container rounded-full" />
      <div className="h-3 w-12 bg-surface-container rounded-full" />
      <div className="h-3 w-10 bg-surface-container rounded-full" />
    </div>
  </div>
);

export const QuestionsGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <QuestionCardSkeleton key={i} />
    ))}
  </div>
);

export const AnswerSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-surface-container flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-surface-container rounded mb-1" />
        <div className="h-3 w-16 bg-surface-container rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-surface-container rounded w-full" />
      <div className="h-3 bg-surface-container rounded w-5/6" />
      <div className="h-3 bg-surface-container rounded w-4/6" />
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-surface-container mb-4" />
    <div className="h-4 w-24 bg-surface-container rounded mb-2" />
    <div className="h-3 w-32 bg-surface-container rounded" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon = 'search_off', title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant">{icon}</span>
    </div>
    <h3 className="text-headline-md font-semibold text-on-surface mb-3">{title}</h3>
    {description && <p className="text-body-md text-on-surface-variant max-w-sm mb-6">{description}</p>}
    {action && (
      <button onClick={action.onClick} className="btn-primary text-sm py-2.5 px-6">
        {action.label}
      </button>
    )}
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────
export const ErrorState = ({ message, retry }: { message?: string; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-4">
      <span className="material-symbols-outlined text-3xl text-error">error</span>
    </div>
    <p className="text-body-md text-on-surface-variant mb-4">{message || 'Something went wrong'}</p>
    {retry && (
      <button onClick={retry} className="btn-secondary text-sm py-2 px-5">
        Try again
      </button>
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  icon: string;
  title: string;
  action?: { label: string; to: string };
}

export const SectionHeader = ({ icon, title, action }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
      <span className="material-symbols-outlined text-primary-container text-[24px]">{icon}</span>
      {title}
    </h2>
    {action && (
      <a
        href={action.to}
        className="text-primary-container hover:text-primary text-label-md font-semibold flex items-center gap-1 transition-colors"
      >
        {action.label}
        <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
      </a>
    )}
  </div>
);

// ─── Stats badge ──────────────────────────────────────────────────────────────
export const StatBadge = ({ label, value, icon }: { label: string; value: number | string; icon: string }) => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 text-center">
    <span className="material-symbols-outlined text-primary-container text-3xl mb-2">{icon}</span>
    <div className="text-headline-md font-bold text-on-surface">{value}</div>
    <div className="text-label-md text-on-surface-variant">{label}</div>
  </div>
);
