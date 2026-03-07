import React, { useEffect, useState } from "react";
import { useSettings } from "~/app/context/SettingsContext";

interface UnifiedAmountProps {
  sats: number | string;
  className?: string;
  primary?: "sats" | "fiat"; // Welcher Wert soll groß angezeigt werden?
  showSecondary?: boolean; // Soll der jeweils andere Wert klein daneben stehen?
}

/**
 * JARVIS Prototype: UnifiedAmount Component
 * 
 * Diese Komponente zentralisiert die Anzeige von BTC/Sats und Fiat-Werten.
 * Sie nutzt den bestehenden SettingsContext, um Kursdaten und Nutzerpräferenzen abzurufen.
 */
const UnifiedAmount: React.FC<UnifiedAmountProps> = ({
  sats,
  className = "",
  primary = "sats",
  showSecondary = true,
}) => {
  const { settings, getFormattedFiat, getFormattedSats, isLoading } = useSettings();
  const [fiatValue, setFiatValue] = useState<string | null>(null);

  const amountSats = Number(sats);
  const formattedSats = getFormattedSats(amountSats);

  useEffect(() => {
    let isMounted = true;
    if (settings.showFiat && amountSats > 0) {
      getFormattedFiat(amountSats).then((val) => {
        if (isMounted) setFiatValue(val);
      });
    }
    return () => { isMounted = false; };
  }, [amountSats, settings.showFiat, getFormattedFiat]);

  if (isLoading) return <span className="animate-pulse bg-gray-200 rounded w-16 h-4 inline-block" />;

  const fiatActive = settings.showFiat && fiatValue;

  // Logik für die Anzeige
  const renderPrimary = () => {
    if (primary === "fiat" && fiatActive) {
      return <span className="font-bold">{fiatValue}</span>;
    }
    return <span className="font-bold">{formattedSats}</span>;
  };

  const renderSecondary = () => {
    if (!showSecondary) return null;
    
    if (primary === "sats" && fiatActive) {
      return <span className="text-gray-500 text-sm ml-1">({fiatValue})</span>;
    }
    if (primary === "fiat" && fiatActive) {
      return <span className="text-gray-500 text-sm ml-1">({formattedSats})</span>;
    }
    return null;
  };

  return (
    <div className={`inline-flex items-baseline ${className}`}>
      {renderPrimary()}
      {renderSecondary()}
    </div>
  );
};

export default UnifiedAmount;
