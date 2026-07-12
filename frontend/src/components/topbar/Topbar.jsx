import { Bell, Eye, EyeOff } from "lucide-react";

import { useAmountVisibility } from "../../context/AmountVisibilityContext";
import { NavigationTrail } from "../navigation/NavigationBar";
import SettingsMenu from "./SettingsMenu";
import ReportsMenu from "./ReportsMenu";
import UserMenu from "./UserMenu";

export default function Topbar() {
  const { isVisible, toggleVisibility } = useAmountVisibility();

  return (
    <header className="sticky top-0 ml-64 z-50 flex h-11 items-center gap-3 border-b border-indigo-400/30 bg-[#e4e4e4] px-5">
      <NavigationTrail className="-ml-2 flex-1" />

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={isVisible ? "Nascondi importi" : "Mostra importi"}
          onClick={toggleVisibility}
          className="relative flex h-8 w-8 shrink-0 items-center justify-center text-black transition-colors duration-150 hover:text-orange-600"
        >
          {isVisible ? (
            <Eye className="h-[20px] w-[20px]" style={{ strokeWidth: 1 }} />
          ) : (
            <EyeOff className="h-[20px] w-[20px]" style={{ strokeWidth: 1 }} />
          )}
        </button>

        <button
          type="button"
          aria-label="Notifiche"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center text-black transition-colors duration-150 hover:text-orange-600"
        >
          <Bell className="h-[20px] w-[20px]" style={{ strokeWidth: 1 }} />
        </button>

        <ReportsMenu />
        <SettingsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
