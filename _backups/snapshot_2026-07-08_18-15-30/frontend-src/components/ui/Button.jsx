export default function Button({
  children,
  type = "button",
  onClick,
  fullWidth = false,
  variant = "primary",
  disabled = false,
}) {
  const styles = {
    primary:
      "border border-amber-600 bg-amber-600 text-white hover:border-amber-700 hover:bg-amber-700",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        h-11
        rounded-md
        px-5
        text-sm
        font-medium
        transition-all
        duration-200
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${styles[variant]}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {children}
    </button>
  );
}
