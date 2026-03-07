import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { numSatsInBtc } from "~/common/utils/currencyConvert";

import { RangeLabel } from "./rangeLabel";

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  fiatValue?: string; // Optional since we handle it internally now
  label: string;
  hint?: string;
  amountExceeded?: boolean;
  rangeExceeded?: boolean;
};

/**
 * Enhanced DualCurrencyField (JARVIS Optimized via Sonnet 4.6 Review)
 * 
 * Supports seamless switching between Sats and Fiat input with high-precision
 * bidirection syncing and mobile-optimized keyboards.
 */
export default function DualCurrencyField({
  label,
  id,
  placeholder,
  required = false,
  pattern,
  title,
  onChange,
  onFocus,
  onBlur,
  value, // Sats value as string
  autoFocus = false,
  autoComplete = "off",
  disabled,
  min,
  max,
  suffix,
  endAdornment,
  hint,
  amountExceeded,
  rangeExceeded,
}: React.InputHTMLAttributes<HTMLInputElement> & Props) {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { t: tCommon } = useTranslation("common");
  const { settings, getCurrencyRate } = useSettings();
  
  const [isFiatMode, setIsFiatMode] = useState(false);
  const [localFiatValue, setLocalFiatValue] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  
  const inputEl = useRef<HTMLInputElement>(null);
  const rateRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Constants for precision math
  const PRECISION = 1_000_000;

  // Initialize and sync currency rate
  useEffect(() => {
    let isMounted = true;
    getCurrencyRate().then((res) => {
      if (isMounted) {
        const rateValue = typeof res === "number" ? res : res.rate;
        setRate(rateValue);
        rateRef.current = rateValue;
      }
    });
    return () => { isMounted = false; };
  }, [getCurrencyRate, settings.currency]);

  // Sync Fiat field when Sats change (only if NOT in Fiat mode)
  useEffect(() => {
    if (!isFiatMode && rate && value) {
      const numericSats = parseInt(String(value));
      if (!isNaN(numericSats)) {
        const calculatedFiat = (numericSats / numSatsInBtc) * rate;
        setLocalFiatValue(calculatedFiat.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }));
      } else {
        setLocalFiatValue("");
      }
    } else if (!value) {
      setLocalFiatValue("");
    }
  }, [value, rate, isFiatMode]);

  const handleFiatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setLocalFiatValue(rawInput);
    
    if (rateRef.current) {
      // Handle both . and , as decimal separators
      const sanitized = rawInput.replace(",", ".");
      const numericFiat = parseFloat(sanitized);
      
      if (!isNaN(numericFiat)) {
        // High precision math to avoid IEEE 754 drift
        const rateInt = Math.round(rateRef.current * PRECISION);
        const calculatedSats = Math.round((numericFiat * numSatsInBtc * PRECISION) / rateInt);
        
        if (onChangeRef.current) {
          const fakeEvent = {
            ...e,
            target: { ...e.target, value: calculatedSats.toString(), name: id }
          } as React.ChangeEvent<HTMLInputElement>;
          onChangeRef.current(fakeEvent);
        }
      }
    }
  }, [id, numSatsInBtc, PRECISION]);

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFiatMode(!isFiatMode);
    setTimeout(() => inputEl.current?.focus(), 0);
  };

  const conversionHint = useMemo(() => {
    if (!settings.showFiat || !rate) return null;
    if (isFiatMode) {
      return value ? `≈ ${value} Sats` : null;
    } else {
      return localFiatValue ? `≈ ${localFiatValue} ${settings.currency}` : null;
    }
  }, [isFiatMode, localFiatValue, value, settings.showFiat, settings.currency, rate]);

  const outerStyles =
    "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  return (
    <div className="relative block m-0">
      <div className="flex justify-between items-center w-full">
        <label htmlFor={id} className="font-medium text-gray-800 dark:text-white">
          {label}
        </label>
        <div className="flex gap-3 items-center">
          {rate !== null && (
            <button
              onClick={toggleMode}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              title={isFiatMode ? "Switch to Sats" : "Switch to Fiat"}
            >
              {isFiatMode ? "→ Sats" : `→ ${settings.currency}`}
            </button>
          )}
          {(min || max) && (
            <span
              className={classNames(
                "text-xs text-gray-700 dark:text-neutral-400",
                !!rangeExceeded && "text-red-500 dark:text-red-500"
              )}
            >
              <RangeLabel min={min} max={max} /> {tCommon("sats_other")}
            </span>
          )}
        </div>
      </div>

      <div
        className={classNames(
          "flex items-center overflow-hidden field mt-1 px-3 py-1",
          "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1",
          !hint && "mb-2",
          (!!amountExceeded || !!rangeExceeded) && "border-red-500 dark:border-red-500",
          outerStyles
        )}
      >
        <input
          ref={inputEl}
          type={isFiatMode ? "text" : "number"}
          inputMode={isFiatMode ? "decimal" : "numeric"}
          name={id}
          id={id}
          className={classNames(
            "dual-currency-field",
            "block w-full placeholder-gray-500 dark:placeholder-gray-600 dark:text-white",
            "px-0 border-0 focus:ring-0 bg-transparent"
          )}
          placeholder={isFiatMode ? "0.00" : (placeholder || "0")}
          required={required}
          pattern={pattern}
          title={title}
          onChange={isFiatMode ? handleFiatChange : onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          value={isFiatMode ? localFiatValue : value}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          disabled={disabled}
          min={isFiatMode ? undefined : min}
          max={isFiatMode ? undefined : max}
        />

        {conversionHint && (
          <p className="text-gray-500 text-sm whitespace-nowrap ml-2 pointer-events-none">
            {conversionHint}
          </p>
        )}

        {suffix && !conversionHint && (
          <span
            className="flex items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white"
            onClick={() => inputEl.current?.focus()}
          >
            {suffix}
          </span>
        )}

        {endAdornment && (
          <span className="flex items-center bg-white dark:bg-black dark:text-neutral-400 ml-2">
            {endAdornment}
          </span>
        )}
      </div>
      
      {hint && (
        <p
          className={classNames(
            "my-1 text-xs text-gray-700 dark:text-neutral-400",
            !!amountExceeded && "text-red-500 dark:text-red-500"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
