import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReportsMenu() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/accounting/reports")}
      aria-label="Stampa e resoconti"
      title="Stampa e resoconti"
      className="flex h-8 w-8 shrink-0 items-center justify-center text-black transition-colors duration-150 hover:text-orange-600"
    >
      <Printer className="h-[20px] w-[20px]" style={{ strokeWidth: 1 }} />
    </button>
  );
}
