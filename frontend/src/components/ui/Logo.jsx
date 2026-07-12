import logo from "../../assets/logo-v3.png";

export default function Logo({ compact = false }) {
  return (
    <div className={`${compact ? "h-8" : "h-14"}`}>
      <img
        src={logo}
        alt="MGCF"
        className={`h-full w-auto select-none object-contain`}
        draggable={false}
      />
    </div>
  );
}
