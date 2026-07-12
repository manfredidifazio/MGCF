import { Menu } from "@headlessui/react";
import { Fragment } from "react";
import {
  AlignLeft,
  Landmark,
  ChevronDown,
  Settings,
  Building2,
  ReceiptText,
  Truck,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const items = [
  { label: "Gestisci conti", icon: Landmark, path: "/settings/accounts" },
  { label: "Gestisci tasse", icon: ReceiptText, path: "/settings/taxes" },
  { label: "Gestisci immobili", icon: Building2, path: "/settings/properties" },
  { label: "Gestisci veicoli", icon: Truck, path: "/settings/vehicles" },
  { label: "Gestisci causali", icon: AlignLeft, path: "/settings/causes" },
];

export default function SettingsMenu() {
  const location = useLocation();

  return (
    <Menu as="div" className="relative flex h-8 w-max shrink-0 rounded-md border border-slate-200 bg-white">
      <NavLink
        to="/settings"
        className={({ isActive }) => `flex h-full items-center gap-2 rounded-l-md px-3 text-[12px] font-medium tracking-wide transition-colors duration-150 hover:font-semibold hover:text-sky-700 ${isActive ? "font-semibold text-sky-700" : "text-slate-700"}`}
      >
        <Settings className="h-[18px] w-[18px] text-current" />
        <span>IMPOSTAZIONI</span>
      </NavLink>
      <Menu.Button
        aria-label="Apri menu Impostazioni"
        title="Apri menu"
        className="flex h-full w-8 items-center justify-center rounded-r-md border-l border-slate-100 text-slate-400 transition-colors duration-150 hover:text-sky-700"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </Menu.Button>

      <Menu.Items className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-md border border-slate-200 bg-white py-1.5 focus:outline-none">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <Fragment key={item.label}>
              {index > 0 && <div className="mx-3 border-t border-slate-200" />}
              <Menu.Item>
                {({ focus }) => (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${focus || isActive || location.pathname === item.path ? "font-semibold text-sky-700" : "font-normal text-slate-700"}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-current" />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </Menu.Item>
            </Fragment>
          );
        })}
      </Menu.Items>
    </Menu>
  );
}
