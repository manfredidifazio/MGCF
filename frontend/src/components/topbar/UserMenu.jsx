import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UserMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleClick() {
    navigate("/user-menu");
  }

  const getInitials = (username) => {
    if (!username) return "U";
    const words = username.split(" ");
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join("");
  };
  
  const initials = getInitials(user?.username);

  return (
    <button
      onClick={handleClick}
      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500 text-xs font-normal text-white transition-colors hover:bg-orange-600"
    >
      {initials}
    </button>
  );
}
