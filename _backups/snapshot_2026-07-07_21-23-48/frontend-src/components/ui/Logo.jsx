import logo from "../../assets/logo-v3.png";

export default function Logo({ compact = false }) {
  return (
    <img
      src={logo}
      alt="MGCF Manfredi Di Fazio"
      className={`w-auto select-none object-contain ${compact ? "h-11" : "h-24"}`}
      draggable={false}
    />
  );
}
