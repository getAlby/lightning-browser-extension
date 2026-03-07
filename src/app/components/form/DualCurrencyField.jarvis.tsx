import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";
import { numSatsInBtc } from "~/common/utils/currencyConvert";
import { classNames } from "~/app/utils";
import { RangeLabel } from "./DualCurrencyField/rangeLabel";

/**
 * Props for DualCurrencyField.
 *
 * NOTE: `value` is always the canonical Sats value (as a string), matching the
 * existing DualCurrencyField contract so parent components require no changes.
 */
export type Props = {
  /** Canonical Sats amount as string (e.g. "21000"). */
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  label?: string;
  hint?: string;
  suffix?: string;
  endAdornment?: React.ReactNode;
  amountExceeded?: boolean;
  rangeExceeded?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  autoFocus?: boolean;
};

// ---------------------------------------------------------------------------
// Pure math helpers – no floating-point surprises
// ---------------------------------------------------------------------------

/**
 * Convert sats (integer) → fiat using BigInt-safe integer arithmetic.
 * Returns a regular JS number suitable for display.
 */
function satsToFiat(sats: number, rate: number): number {
  // rate can be fractional, so we amplify precision, then divide back.
  // Using integer arithmetic avoids most floating-point drift.
  const PRECISION = 1_000_000; // 6 decimal places of precision
  const rateInt = Math.round(rate * PRECISION);
  return (sats * rateInt) / (numSatsInBtc * PRECISION);
}

/**
 * Convert fiat (float string already normalised to `.` decimal) → sats.
 * Returns an integer or NaN.
 */
function fiatToSats(fiatStr: string, rate: number): number {
  const fiatNum = parseFloat(fiatStr);
  if (isNaN(fiatNum) || !isFinite(fiatNum) || rate <= 0) return NaN;
  return Math.round((fiatNum / rate) * numSatsInBtc);
}

/**
 * Normalise a user-typed fiat string for parseFloat:
 *  - Replace comma decimal separator with dot ("1,50" → "1.50")
 *  - Strip currency symbols / spaces that might be pasted
 */
function normaliseFiatInput(raw: string): string {
  return raw.replace(/[^0-9.,\-]/g, "").replace(",", ".");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DualCurrencyField: React.FC<Props> = ({
  value,
  onChange,
  id = "amount",
  label = "Amount",
  hint,
  amountExceeded,
  rangeExceeded,
  suffix,
  endAdornment,
  disabled,
  autoFocus = false,
  min,
  max,
}) => {
  const { t: tCommon } = useTranslation("common");
  const { settings, getCurrencyRate } = useSettings();

  const [isFiatMode, setIsFiatMode] = useState(false);
  /**
   * Raw string that the user sees while typing in fiat mode.
   * We deliberately keep this as the raw display value (comma or dot) so the
   * input cursor / IME is never disrupted. Normalisation happens only for math.
   */
  const [fiatInput, setFiatInput] = useState("");
  const [rate, setRate] = useState<number | null>(null);

  // Ref so stable callbacks never cause stale-closure issues with the rate.
  const rateRef = useRef<number | null>(null);
  rateRef.current = rate;

  // Prevent duplicate getCurrencyRate() calls while one is in flight.
  const fetchingRate = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch rate once on mount (and when currency changes) ─────────────────
  useEffect(() => {
    if (fetchingRate.current) return;
    fetchingRate.current = true;

    getCurrencyRate()
      .then((r) => {
        setRate(r);
      })
      .catch(console.error)
      .finally(() => {
        fetchingRate.current = false;
      });
    // getCurrencyRate already handles stale-cache logic internally; we only
    // need to re-fetch when the user's currency preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.currency]);

  // ── Ignore scroll wheel on the input (same as original) ──────────────────
  useEffect(() => {
    const ignoreScroll = (evt: globalThis.WheelEvent) => evt.preventDefault();
    const el = inputRef.current;
    el?.addEventListener("wheel", ignoreScroll);
    return () => el?.removeEventListener("wheel", ignoreScroll);
  }, []);

  // ── Keep fiatInput in sync when the canonical sats value changes externally
  // (e.g. parent resets the field) – but only when NOT in fiat-mode typing to
  // avoid disrupting the user mid-entry.
  useEffect(() => {
    if (isFiatMode) return; // user is driving; don't clobber their input
    if (!value || !rate) {
      setFiatInput("");
      return;
    }
    const sats = parseInt(value, 10);
    if (isNaN(sats)) {
      setFiatInput("");
      return;
    }
    const fiat = satsToFiat(sats, rate);
    // Show a clean decimal string; locale-aware formatting would confuse
    // parseFloat later, so we use a plain fixed string here.
    setFiatInput(fiat > 0 ? fiat.toFixed(2) : "");
  }, [value, rate, isFiatMode]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFiatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setFiatInput(raw); // preserve exactly what the user typed (cursor safety)

      const currentRate = rateRef.current;
      if (!currentRate) return;

      const sats = fiatToSats(normaliseFiatInput(raw), currentRate);
      if (isNaN(sats)) return; // incomplete input ("1.", "1,") – don't fire onChange

      // Synthesise a ChangeEvent with the canonical sats value.
      // We reuse the original event object shape to stay type-safe.
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: sats.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    },
    [onChange]
  );

  const toggleMode = useCallback(() => {
    setIsFiatMode((prev) => !prev);
  }, []);

  // ── Derived display values ────────────────────────────────────────────────

  /** Formatted conversion hint shown below the input. */
  const conversionHint = useMemo<string>(() => {
    if (!settings.showFiat || !rate) return "";
    if (isFiatMode) {
      // Show sats equivalent
      const sats = fiatToSats(normaliseFiatInput(fiatInput), rate);
      if (isNaN(sats)) return "";
      return `≈ ${sats.toLocaleString()} ${tCommon("sats_other")}`;
    } else {
      // Show fiat equivalent
      const satsNum = parseInt(value, 10);
      if (!value || isNaN(satsNum)) return "";
      const fiat = satsToFiat(satsNum, rate);
      return `≈ ${fiat.toLocaleString(settings.locale.replace("_", "-"), {
        style: "currency",
        currency: settings.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }, [
    isFiatMode,
    fiatInput,
    value,
    rate,
    settings.showFiat,
    settings.currency,
    settings.locale,
    tCommon,
  ]);

  // ── Shared input styles (mirrors original DualCurrencyField) ─────────────
  const outerStyles =
    "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  const inputNode = (
    <input
      ref={inputRef}
      type={isFiatMode ? "text" : "number"}
      inputMode={isFiatMode ? "decimal" : "numeric"}
      name={id}
      id={id}
      className={classNames(
        "dual-currency-field",
        "block w-full placeholder-gray-500 dark:placeholder-gray-600 dark:text-white",
        "px-0 border-0 focus:ring-0 bg-transparent"
      )}
      placeholder={isFiatMode ? "0.00" : "0"}
      onChange={isFiatMode ? handleFiatChange : onChange}
      value={isFiatMode ? fiatInput : value}
      autoFocus={autoFocus}
      autoComplete="off"
      disabled={disabled}
      min={isFiatMode ? undefined : min}
      max={isFiatMode ? undefined : max}
    />
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative block m-0">
      {/* Label row */}
      <div className="flex justify-between items-center w-full">
        <label
          htmlFor={id}
          className="font-medium text-gray-800 dark:text-white"
        >
          {label}
        </label>

        <div className="flex items-center gap-3">
          {/* Range hint (sats mode only) */}
          {!isFiatMode && (min !== undefined || max !== undefined) && (
            <span
              className={classNames(
                "text-xs text-gray-700 dark:text-neutral-400",
                !!rangeExceeded && "text-red-500 dark:text-red-500"
              )}
            >
              <RangeLabel min={min} max={max} /> {tCommon("sats_other")}
            </span>
          )}

          {/* Toggle button – only when a rate is available */}
          {rate !== null && (
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold"
              aria-label={
                isFiatMode
                  ? tCommon("switch_to_sats", { defaultValue: "Switch to Sats" })
                  : tCommon("switch_to_currency", {
                      currency: settings.currency,
                      defaultValue: `Switch to ${settings.currency}`,
                    })
              }
            >
              {isFiatMode ? "Sats" : settings.currency}
            </button>
          )}
        </div>
      </div>

      {/* Input wrapper */}
      <div
        className={classNames(
          "flex items-center overflow-hidden field mt-1 px-3",
          "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1",
          !hint && !conversionHint && "mb-2",
          (!!amountExceeded || !!rangeExceeded) &&
            "border-red-500 dark:border-red-500",
          outerStyles
        )}
      >
        {inputNode}

        {/* Currency / unit badge */}
        <span className="flex items-center px-2 text-sm text-gray-500 dark:text-neutral-400 pointer-events-none select-none">
          {isFiatMode ? settings.currency : tCommon("sats_other")}
        </span>

        {suffix && (
          <span
            className="flex items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white"
            onClick={() => inputRef.current?.focus()}
          >
            {suffix}
          </span>
        )}

        {endAdornment && (
          <span className="flex items-center bg-white dark:bg-black dark:text-neutral-400">
            {endAdornment}
          </span>
        )}
      </div>

      {/* Conversion hint / error hint */}
      {conversionHint && (
        <p className="my-1 text-xs text-gray-500 dark:text-neutral-400 italic">
          {conversionHint}
        </p>
      )}
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
};

export default DualCurrencyField;
