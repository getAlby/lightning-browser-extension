import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { numSatsInBtc } from "~/common/utils/currencyConvert";

import { RangeLabel } from "./rangeLabel";

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  /** Controlled fiat value from parent. When provided, the component uses it
   *  as the initial / externally-driven fiat display value. */
  fiatValue?: string;
  /** Called whenever the internal fiat value changes, keeping the parent in sync. */
  onFiatValueChange?: (value: string) => void;
  label: string;
  hint?: string;
  amountExceeded?: boolean;
  rangeExceeded?: boolean;
};

/**
 * Strip grouping separators (thousands dots/commas) and normalise the decimal
 * separator to `.` so that `parseFloat` always works correctly regardless of
 * locale.
 *
 * Strategy:
 * 1. If the string contains both `.` and `,` the one that appears last is the
 *    decimal separator; the other is a grouping separator → remove grouping,
 *    replace decimal with `.`.
 * 2. If the string contains only `,` treat it as a decimal separator.
 * 3. If the string contains only `.` it is already canonical.
 */
function normalizeFiatInput(raw: string): string {
  const lastDot = raw.lastIndexOf(".");
  const lastComma = raw.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    // Both separators present – the later one is the decimal separator
    if (lastComma > lastDot) {
      // European style: 1.234,56 → 1234.56
      return raw.replace(/\./g, "").replace(",", ".");
    } else {
      // Anglo style: 1,234.56 → 1234.56
      return raw.replace(/,/g, "");
    }
  }

  if (lastComma !== -1) {
    // Only comma present – treat as decimal separator: 1234,56 → 1234.56
    return raw.replace(",", ".");
  }

  // Only dot or no separator – already canonical
  return raw;
}

/**
 * Enhanced DualCurrencyField (JARVIS Optimized via Sonnet 4.6 Review)
 *
 * Supports seamless switching between Sats and Fiat input with high-precision
 * bidirectional syncing and mobile-optimized keyboards.
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
  fiatValue,
  onFiatValueChange,
  hint,
  amountExceeded,
  rangeExceeded,
}: React.InputHTMLAttributes<HTMLInputElement> & Props) {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { t: tCommon } = useTranslation("common");
  const { settings, getCurrencyRate } = useSettings();

  const [isFiatMode, setIsFiatMode] = useState(false);
  // Prefer the controlled `fiatValue` prop as the initial state when provided
  const [localFiatValue, setLocalFiatValue] = useState(fiatValue ?? "");
  const [rate, setRate] = useState<number | null>(null);

  const inputEl = useRef<HTMLInputElement>(null);
  const rateRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /**
   * Hysteresis guard: while the user is actively typing in the fiat field we
   * do NOT want a background rate-refresh to clobber their in-progress input.
   */
  const isTypingRef = useRef(false);

  // Constants for precision math
  const PRECISION = 1_000_000;

  // Initialize and sync currency rate
  useEffect(() => {
    let isMounted = true;
    getCurrencyRate().then((res: number | { rate: number }) => {
      if (isMounted) {
        const rateValue = typeof res === "number" ? res : res.rate;
        setRate(rateValue);
        rateRef.current = rateValue;
      }
    });
    return () => {
      isMounted = false;
    };
  }, [getCurrencyRate, settings.currency]);

  // When a controlled `fiatValue` prop changes, sync internal state (but only
  // when the user is not actively typing to avoid fighting the user).
  useEffect(() => {
    if (fiatValue !== undefined && !isTypingRef.current) {
      setLocalFiatValue(fiatValue);
    }
  }, [fiatValue]);

  // Sync Fiat field when Sats change (only if NOT in Fiat mode and user is not
  // currently typing – hysteresis guard).
  useEffect(() => {
    if (!isFiatMode && rate && value && !isTypingRef.current) {
      const numericSats = parseInt(String(value));
      if (!isNaN(numericSats)) {
        const calculatedFiat = (numericSats / numSatsInBtc) * rate;
        setLocalFiatValue(
          calculatedFiat.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } else {
        setLocalFiatValue("");
      }
    } else if (!value) {
      setLocalFiatValue("");
    }
  }, [value, rate, isFiatMode]);

  const handleFiatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      setLocalFiatValue(rawInput);
      onFiatValueChange?.(rawInput);

      if (rateRef.current) {
        const normalized = normalizeFiatInput(rawInput);
        const numericFiat = parseFloat(normalized);

        if (!isNaN(numericFiat)) {
          // High precision math to avoid IEEE 754 drift
          const rateInt = Math.round(rateRef.current * PRECISION);
          const calculatedSats = Math.round(
            (numericFiat * numSatsInBtc * PRECISION) / rateInt
          );

          if (onChangeRef.current) {
            const fakeEvent = {
              ...e,
              target: {
                ...e.target,
                value: calculatedSats.toString(),
                name: id,
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChangeRef.current(fakeEvent);
          }
        }
      }
    },
    [id, onFiatValueChange, PRECISION]
  );

  /**
   * Mark the user as "typing" on focus so that background rate updates do not
   * overwrite the field while they are mid-entry.
   */
  const handleFiatFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      isTypingRef.current = true;
      onFocus?.(e);
    },
    [onFocus]
  );

  /**
   * Clear the typing guard on blur so that the next background rate sync can
   * update the fiat display again.
   */
  const handleFiatBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      isTypingRef.current = false;
      onBlur?.(e);
    },
    [onBlur]
  );

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
  }, [
    isFiatMode,
    localFiatValue,
    value,
    settings.showFiat,
    settings.currency,
    rate,
  ]);

  const outerStyles =
    "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  // Explicit null/undefined checks so that min={0} or max={0} are respected
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;

  return (
    <div className="relative block m-0">
      <div className="flex justify-between items-center w-full">
        <label
          htmlFor={id}
          className="font-medium text-gray-800 dark:text-white"
        >
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
          {(hasMin || hasMax) && (
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
          (!!amountExceeded || !!rangeExceeded) &&
            "border-red-500 dark:border-red-500",
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
          placeholder={isFiatMode ? "0.00" : placeholder || "0"}
          required={required}
          pattern={pattern}
          title={title}
          onChange={isFiatMode ? handleFiatChange : onChange}
          onFocus={isFiatMode ? handleFiatFocus : onFocus}
          onBlur={isFiatMode ? handleFiatBlur : onBlur}
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
