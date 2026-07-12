import { Printer } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReportsMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname.startsWith("/stampa-resoconti");

  return (
    <button
      type="button"
      onClick={() => navigate("/stampa-resoconti")}
      aria-label="Stampa e resoconti"
      title="Stampa e resoconti"
      className={`flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-150 ${isActive ? "text-orange-600" : "text-black hover:text-orange-600"}`}
    >
      <Printer className="h-[20px] w-[20px]" style={{ strokeWidth: 1 }} />
    </button>
  );
}
