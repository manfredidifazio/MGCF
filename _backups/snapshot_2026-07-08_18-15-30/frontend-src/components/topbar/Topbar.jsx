import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { NavigationTrail, PageSearch } from "../navigation/NavigationBar";
import Logo from "../ui/Logo";
import SettingsMenu from "./SettingsMenu";
import ReportsMenu from "./ReportsMenu";
import UserMenu from "./UserMenu";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link
          to="/dashboard"
          aria-label="Vai alla home"
          title="Home"
          className="block shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <Logo compact />
        </Link>
        <NavigationTrail />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PageSearch />
        <button
          type="button"
          aria-label="Notifiche"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-amber-600 transition-colors duration-150 hover:border-amber-300 hover:bg-amber-50"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>

        <ReportsMenu />
        <SettingsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
