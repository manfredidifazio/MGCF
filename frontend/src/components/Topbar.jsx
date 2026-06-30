import { useState } from "react";
import { Cog6ToothIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function Topbar() {
  const [openSettings, setOpenSettings] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  return (
    <header className="h-[84px] bg-white border-b border-slate-200 flex items-center justify-end px-10">

      <nav className="flex items-center gap-8">

        <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition">
          <HomeIcon className="w-5 h-5" />
          Home
        </button>

        <div className="relative">

          <button
            onClick={() => {
              setOpenSettings(!openSettings);
              setOpenUser(false);
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Impostazioni
          </button>

          {openSettings && (
            <div className="absolute right-0 mt-4 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">

              <button className="w-full text-left px-5 py-3 hover:bg-slate-50">
                Impostazioni Conti
              </button>

              <button className="w-full text-left px-5 py-3 hover:bg-slate-50">
                Impostazioni Immobili
              </button>

              <button className="w-full text-left px-5 py-3 hover:bg-slate-50">
                Impostazioni Tasse
              </button>

              <button className="w-full text-left px-5 py-3 hover:bg-slate-50">
                Impostazioni Beni Mobili
              </button>

            </div>
          )}

        </div>

        <div className="relative">

          <button
            onClick={() => {
              setOpenUser(!openUser);
              setOpenSettings(false);
            }}
            className="flex items-center gap-2"
          >

            <UserCircleIcon className="w-9 h-9 text-blue-600" />

            <div className="text-left">

              <div className="text-sm text-slate-800">
                Manfredi
              </div>

              <div className="text-xs text-slate-400">
                Amministratore
              </div>

            </div>

          </button>

          {openUser && (

            <div className="absolute right-0 mt-4 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">

              <button className="w-full text-left px-5 py-3 hover:bg-slate-50">
                Cambia Password
              </button>

              <button className="w-full text-left px-5 py-3 hover:bg-slate-50 text-red-500">
                Logout
              </button>

            </div>

          )}

        </div>

      </nav>

    </header>
  );
}