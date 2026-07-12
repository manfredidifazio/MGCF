import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsMenu() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/settings")}
      aria-label="Impostazioni"
      title="Impostazioni"
      className="flex h-8 w-8 shrink-0 items-center justify-center text-black transition-colors duration-150 hover:text-orange-600"
    >
      <Settings className="h-[20px] w-[20px]" style={{ strokeWidth: 1 }} />
    </button>
  );
}
