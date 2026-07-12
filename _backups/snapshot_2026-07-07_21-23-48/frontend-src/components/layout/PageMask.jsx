export default function PageMask({ icon: Icon, title, description, actions, children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {(title || description || actions) && (
        <div className="border-b border-slate-200 px-4 py-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {title && (
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="h-6 w-6 shrink-0 text-amber-600" />}
                  <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                </div>
              )}
              {description && <p className="mt-2 text-slate-500">{description}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}
