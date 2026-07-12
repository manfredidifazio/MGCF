import { useAmountVisibility } from "../../context/AmountVisibilityContext";

export default function Amount({ children, className = "" }) {
  const { isVisible } = useAmountVisibility();

  // Se visibile, mostra il contenuto normalmente
  if (isVisible) {
    return <span className={className}>{children}</span>;
  }

  // Se nascosto, genera pallini in base al numero di caratteri
  let textContent = "";
  
  if (typeof children === "string") {
    textContent = children;
  } else if (typeof children === "number") {
    textContent = String(children);
  } else if (children && typeof children === "object" && "props" in children && "type" in children) {
    // È un JSX element, prova ad estrarre il testo
    textContent = JSON.stringify(children);
  } else {
    textContent = String(children || "");
  }

  // Conta i caratteri (escludendo spazi)
  const charCount = textContent.replace(/\s/g, "").length;
  const dots = "•".repeat(Math.max(charCount, 6));

  return <span className={className}>{dots}</span>;
}
