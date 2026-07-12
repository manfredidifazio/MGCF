import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  dark = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const currentType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${dark ? "text-white/70" : "text-slate-700"}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={currentType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            h-11
            w-full
            rounded-lg
            border
            px-4
            text-sm
            outline-none
            transition-all
            duration-200
            ${dark
              ? "border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              : "border-gray-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            }
            ${isPasswordField ? "pr-10" : ""}
          `}
        />
        {isPasswordField && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowPassword(true);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              setShowPassword(false);
            }}
            onMouseLeave={() => setShowPassword(false)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              dark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {showPassword ? (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
