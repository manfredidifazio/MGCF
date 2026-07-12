import { createContext, useContext, useState, useEffect } from "react";

const AmountVisibilityContext = createContext();

export function AmountVisibilityProvider({ children }) {
  const [isVisible, setIsVisible] = useState(() => {
    // Leggi dal localStorage al caricamento iniziale
    const stored = localStorage.getItem("amountVisibility");
    return stored !== null ? JSON.parse(stored) : true;
  });

  // Salva in localStorage ogni volta che cambia
  useEffect(() => {
    localStorage.setItem("amountVisibility", JSON.stringify(isVisible));
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <AmountVisibilityContext.Provider value={{ isVisible, toggleVisibility }}>
      {children}
    </AmountVisibilityContext.Provider>
  );
}

export function useAmountVisibility() {
  const context = useContext(AmountVisibilityContext);
  if (!context) {
    throw new Error("useAmountVisibility must be used within AmountVisibilityProvider");
  }
  return context;
}
