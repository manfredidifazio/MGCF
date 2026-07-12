export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          h-14
          w-full
          rounded-lg
          border
          border-slate-200
          bg-white
          px-5
          text-base
          text-slate-800
          outline-none
          transition-all
          duration-200
          placeholder:text-slate-400
          focus:border-amber-500
          focus:ring-4
          focus:ring-amber-100
        "
      />
    </div>
  );
}
