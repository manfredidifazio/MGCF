import { Menu } from "@headlessui/react";
import {
  LogOut,
  ChevronDown,
  CircleUser,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdministrator = String(user?.role || "").toLowerCase() === "administrator";

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  const initial = user?.username?.[0]?.toUpperCase() || "U";

  return (
    <Menu as="div" className="relative w-max shrink-0">
      <Menu.Button className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium tracking-wide text-slate-700 transition-colors duration-150 hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[9px] font-medium text-white">{initial}</span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[11px] uppercase">{user?.username || "Utente"}</span>
          <span className="truncate text-[9px] font-normal text-slate-400">{user?.role || "User"}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </Menu.Button>

      <Menu.Items className="absolute left-0 z-50 mt-1.5 w-full overflow-hidden rounded-md border border-slate-200 bg-white py-1 focus:outline-none">
        <Menu.Item>
          {({ focus }) => (
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-normal transition-colors duration-150 ${focus ? "bg-amber-50" : ""}`}
            >
              <CircleUser className="h-[18px] w-[18px] text-slate-500" />
              <span className="text-slate-700">Profilo</span>
            </button>
          )}
        </Menu.Item>

        {isAdministrator && (
          <Menu.Item>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-normal transition-colors duration-150 ${focus ? "bg-amber-50" : ""}`}
              >
                <Users className="h-[18px] w-[18px] text-slate-500" />
                <span className="text-slate-700">Gestisci utenti</span>
              </button>
            )}
          </Menu.Item>
        )}

        <div className="mx-3 border-t border-slate-200" />

        <Menu.Item>
          {({ focus }) => (
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-normal text-red-600 transition-colors duration-150 ${focus ? "bg-red-50" : ""}`}
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Logout</span>
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
