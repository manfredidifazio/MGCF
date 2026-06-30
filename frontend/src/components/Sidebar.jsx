import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  ReceiptPercentIcon,
  BuildingOffice2Icon,
  TruckIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";

import logo from "../assets/logo.png";

const menuItems = [
  { label: "Dashboard", path: "/", icon: HomeIcon },
  { label: "Accrediti", path: "/accrediti", icon: BanknotesIcon },
  { label: "Estratto Conti", path: "/estratto-conti", icon: BuildingLibraryIcon },
  { label: "Saldo Conti", path: "/saldo-conti", icon: ChartBarIcon },
  { label: "Resoconto Contabile", path: "/resoconto-contabile", icon: PresentationChartLineIcon },
  { label: "Spese / Tasse", path: "/spese-tasse", icon: ReceiptPercentIcon },
  { label: "Spese Immobili", path: "/spese-immobili", icon: BuildingOffice2Icon },
  { label: "Spese Automobili", path: "/spese-automobili", icon: TruckIcon },
  { label: "Stampa Resoconti", path: "/stampa-resoconti", icon: PrinterIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-[270px] h-screen bg-white border-r border-slate-200 shadow-sm flex flex-col">

      <div className="h-28 flex items-center justify-center border-b border-slate-200 bg-white">

  <img
    src={logo}
    alt="MGCF"
    className="h-10 w-auto object-contain"
  />

</div>

      <nav className="flex-1 px-4 py-6 space-y-2">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="w-5 h-5" />

              <span className="text-sm">
                {item.label}
              </span>

            </NavLink>
          );
        })}

      </nav>

      <div className="p-5 border-t border-slate-100">

        <div className="rounded-2xl bg-slate-50 p-4">

          <div className="text-xs text-slate-400">
            MGCF
          </div>

          <div className="text-sm text-slate-700 mt-1">
            Gestionale Contabile
          </div>

          <div className="text-xs text-slate-400 mt-2">
            Versione 1.0
          </div>

        </div>

      </div>

    </aside>
  );
}