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
      "border border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700",
    secondary:
      "border border-gray-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50",
    orange:
      "border border-orange-500 bg-orange-500 text-white hover:bg-orange-600",
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
