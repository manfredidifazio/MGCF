export default function PageMask({ icon: Icon, title, description, actions, children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {(title || description || actions) && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 border-b border-indigo-700">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-5 w-5 shrink-0 text-white" />}
                  <h1 className="text-xl font-semibold text-white">{title}</h1>
                </div>
              )}
              {description && <p className="mt-1 text-sm text-indigo-100">{description}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}
