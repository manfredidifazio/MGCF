export default function PageMask({ icon: Icon, title, description, actions, children }) {
  return (
    <div className="mt-2 md:mt-0 overflow-hidden rounded-xl border border-gray-300 bg-white">
      {(title || description || actions) && (
        <div className="bg-[#e4e4e4] px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-5 w-5 shrink-0 text-black" />}
                  <h1 className="text-xl text-black" style={{ fontWeight: 300 }}>{title}</h1>
                </div>
              )}
              {description && <p className="mt-1 text-sm text-black" style={{ fontWeight: 300 }}>{description}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      <div className="space-y-4 p-4 md:space-y-5 md:p-5">{children}</div>
    </div>
  );
}
