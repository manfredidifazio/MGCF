import { Menu } from "@headlessui/react";
import { Fragment } from "react";
import {
  Bars3BottomLeftIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  HomeModernIcon,
  ReceiptPercentIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

const items = [
  { label: "Gestisci conti", icon: BuildingLibraryIcon, path: "/settings/accounts" },
  { label: "Gestisci tasse", icon: ReceiptPercentIcon, path: "/settings/taxes" },
  { label: "Gestisci immobili", icon: HomeModernIcon, path: "/settings/properties" },
  { label: "Gestisci veicoli", icon: TruckIcon, path: "/settings/vehicles" },
  { label: "Gestisci causali", icon: Bars3BottomLeftIcon, path: "/settings/causes" },
];

export default function SettingsMenu() {
  const navigate = useNavigate();

  return (
    <Menu as="div" className="relative flex h-8 w-max shrink-0 rounded-md border border-slate-200 bg-white">
      <Link
        to="/settings"
        className="flex h-full items-center gap-2 rounded-l-md px-3 text-[12px] font-medium tracking-wide text-slate-700 transition-colors duration-150 hover:bg-amber-50 hover:text-slate-900"
      >
        <Cog6ToothIcon className="h-[18px] w-[18px] text-amber-600" />
        <span>IMPOSTAZIONI</span>
      </Link>
      <Menu.Button
        aria-label="Apri menu Impostazioni"
        title="Apri menu"
        className="flex h-full w-8 items-center justify-center rounded-r-md border-l border-slate-100 text-slate-400 transition-colors duration-150 hover:bg-amber-50 hover:text-slate-700"
      >
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </Menu.Button>

      <Menu.Items className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-md border border-slate-200 bg-white py-1.5 focus:outline-none">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <Fragment key={item.label}>
              {index > 0 && <div className="mx-3 border-t border-slate-200" />}
              <Menu.Item>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => item.path && navigate(item.path)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-normal transition-colors duration-150 ${focus ? "bg-amber-50 text-amber-900" : "text-slate-700"}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                )}
              </Menu.Item>
            </Fragment>
          );
        })}
      </Menu.Items>
    </Menu>
  );
}
