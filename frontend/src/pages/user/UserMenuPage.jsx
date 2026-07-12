import { useNavigate } from "react-router-dom";
import { User, Users, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PageMask from "../../components/layout/PageMask";

export default function UserMenuPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdministrator = String(user?.role || "").toLowerCase() === "administrator";
  const roleText = isAdministrator ? "Amministratore" : "Utente";

  function handleNavigation(path) {
    navigate(path);
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  const menuItems = [
    { label: "Profilo", icon: User, action: () => handleNavigation("/profile"), tone: "from-blue-500 to-cyan-500" },
    ...(isAdministrator ? [{ label: "Gestisci utenti", icon: Users, action: () => handleNavigation("/admin/users"), tone: "from-indigo-500 to-purple-500" }] : []),
    { label: "Logout", icon: LogOut, action: handleLogout, tone: "from-red-500 to-rose-500" },
  ];

  return (
    <PageMask icon={User} title={user?.username || "Menu"} description={roleText}>
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className="flex w-full items-center gap-3 px-5 py-4 text-slate-700 transition-transform hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.tone} text-white`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-left text-sm font-medium text-slate-800">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          );
        })}
      </div>
    </PageMask>
  );
}
