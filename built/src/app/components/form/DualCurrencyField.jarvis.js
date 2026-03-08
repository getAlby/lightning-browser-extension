"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const utils_1 = require("~/app/utils");
const rangeLabel_1 = require("./DualCurrencyField/rangeLabel");
// ---------------------------------------------------------------------------
// Pure math helpers – no floating-point surprises
// ---------------------------------------------------------------------------
/**
 * Convert sats (integer) → fiat using BigInt-safe integer arithmetic.
 * Returns a regular JS number suitable for display.
 */
function satsToFiat(sats, rate) {
    // rate can be fractional, so we amplify precision, then divide back.
    // Using integer arithmetic avoids most floating-point drift.
    const PRECISION = 1000000; // 6 decimal places of precision
    const rateInt = Math.round(rate * PRECISION);
    return (sats * rateInt) / (currencyConvert_1.numSatsInBtc * PRECISION);
}
/**
 * Convert fiat (float string already normalised to `.` decimal) → sats.
 * Returns an integer or NaN.
 */
function fiatToSats(fiatStr, rate) {
    const fiatNum = parseFloat(fiatStr);
    if (isNaN(fiatNum) || !isFinite(fiatNum) || rate <= 0)
        return NaN;
    return Math.round((fiatNum / rate) * currencyConvert_1.numSatsInBtc);
}
/**
 * Normalise a user-typed fiat string for parseFloat:
 *  - Replace comma decimal separator with dot ("1,50" → "1.50")
 *  - Strip currency symbols / spaces that might be pasted
 */
function normaliseFiatInput(raw) {
    return raw.replace(/[^0-9.,-]/g, "").replace(",", ".");
}
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const DualCurrencyField = ({ value, onChange, id = "amount", label = "Amount", hint, amountExceeded, rangeExceeded, suffix, endAdornment, disabled, autoFocus = false, min, max, }) => {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { settings, getCurrencyRate } = (0, SettingsContext_1.useSettings)();
    const [isFiatMode, setIsFiatMode] = (0, react_1.useState)(false);
    /**
     * Raw string that the user sees while typing in fiat mode.
     * We deliberately keep this as the raw display value (comma or dot) so the
     * input cursor / IME is never disrupted. Normalisation happens only for math.
     */
    const [fiatInput, setFiatInput] = (0, react_1.useState)("");
    const [rate, setRate] = (0, react_1.useState)(null);
    // Ref so stable callbacks never cause stale-closure issues with the rate.
    const rateRef = (0, react_1.useRef)(null);
    rateRef.current = rate;
    // Prevent duplicate getCurrencyRate() calls while one is in flight.
    const fetchingRate = (0, react_1.useRef)(false);
    const inputRef = (0, react_1.useRef)(null);
    // ── Fetch rate once on mount (and when currency changes) ─────────────────
    (0, react_1.useEffect)(() => {
        if (fetchingRate.current)
            return;
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
    (0, react_1.useEffect)(() => {
        const ignoreScroll = (evt) => evt.preventDefault();
        const el = inputRef.current;
        el === null || el === void 0 ? void 0 : el.addEventListener("wheel", ignoreScroll);
        return () => el === null || el === void 0 ? void 0 : el.removeEventListener("wheel", ignoreScroll);
    }, []);
    // ── Keep fiatInput in sync when the canonical sats value changes externally
    // (e.g. parent resets the field) – but only when NOT in fiat-mode typing to
    // avoid disrupting the user mid-entry.
    (0, react_1.useEffect)(() => {
        if (isFiatMode)
            return; // user is driving; don't clobber their input
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
    const handleFiatChange = (0, react_1.useCallback)((e) => {
        const raw = e.target.value;
        setFiatInput(raw); // preserve exactly what the user typed (cursor safety)
        const currentRate = rateRef.current;
        if (!currentRate)
            return;
        const sats = fiatToSats(normaliseFiatInput(raw), currentRate);
        if (isNaN(sats))
            return; // incomplete input ("1.", "1,") – don't fire onChange
        // Synthesise a ChangeEvent with the canonical sats value.
        // We reuse the original event object shape to stay type-safe.
        const syntheticEvent = Object.assign(Object.assign({}, e), { target: Object.assign(Object.assign({}, e.target), { value: sats.toString() }) });
        onChange(syntheticEvent);
    }, [onChange]);
    const toggleMode = (0, react_1.useCallback)(() => {
        setIsFiatMode((prev) => !prev);
    }, []);
    // ── Derived display values ────────────────────────────────────────────────
    /** Formatted conversion hint shown below the input. */
    const conversionHint = (0, react_1.useMemo)(() => {
        if (!settings.showFiat || !rate)
            return "";
        if (isFiatMode) {
            // Show sats equivalent
            const sats = fiatToSats(normaliseFiatInput(fiatInput), rate);
            if (isNaN(sats))
                return "";
            return `≈ ${sats.toLocaleString()} ${tCommon("sats_other")}`;
        }
        else {
            // Show fiat equivalent
            const satsNum = parseInt(value, 10);
            if (!value || isNaN(satsNum))
                return "";
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
    const outerStyles = "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";
    const inputNode = ((0, jsx_runtime_1.jsx)("input", { ref: inputRef, type: isFiatMode ? "text" : "number", inputMode: isFiatMode ? "decimal" : "numeric", name: id, id: id, className: (0, utils_1.classNames)("dual-currency-field", "block w-full placeholder-gray-500 dark:placeholder-gray-600 dark:text-white", "px-0 border-0 focus:ring-0 bg-transparent"), placeholder: isFiatMode ? "0.00" : "0", onChange: isFiatMode ? handleFiatChange : onChange, value: isFiatMode ? fiatInput : value, autoFocus: autoFocus, autoComplete: "off", disabled: disabled, min: isFiatMode ? undefined : min, max: isFiatMode ? undefined : max }));
    // ── Render ────────────────────────────────────────────────────────────────
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative block m-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center w-full", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: id, className: "font-medium text-gray-800 dark:text-white", children: label }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [!isFiatMode && (min !== undefined || max !== undefined) && ((0, jsx_runtime_1.jsxs)("span", { className: (0, utils_1.classNames)("text-xs text-gray-700 dark:text-neutral-400", !!rangeExceeded && "text-red-500 dark:text-red-500"), children: [(0, jsx_runtime_1.jsx)(rangeLabel_1.RangeLabel, { min: min, max: max }), " ", tCommon("sats_other")] })), rate !== null && ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: toggleMode, className: "text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold", "aria-label": isFiatMode
                                    ? tCommon("switch_to_sats", {
                                        defaultValue: "Switch to Sats",
                                    })
                                    : tCommon("switch_to_currency", {
                                        currency: settings.currency,
                                        defaultValue: `Switch to ${settings.currency}`,
                                    }), children: isFiatMode ? "Sats" : settings.currency }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("flex items-center overflow-hidden field mt-1 px-3", "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1", !hint && !conversionHint && "mb-2", (!!amountExceeded || !!rangeExceeded) &&
                    "border-red-500 dark:border-red-500", outerStyles), children: [inputNode, (0, jsx_runtime_1.jsx)("span", { className: "flex items-center px-2 text-sm text-gray-500 dark:text-neutral-400 pointer-events-none select-none", children: isFiatMode ? settings.currency : tCommon("sats_other") }), suffix && ((0, jsx_runtime_1.jsx)("span", { className: "flex items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white", onClick: () => { var _a; return (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, children: suffix })), endAdornment && ((0, jsx_runtime_1.jsx)("span", { className: "flex items-center bg-white dark:bg-black dark:text-neutral-400", children: endAdornment }))] }), conversionHint && ((0, jsx_runtime_1.jsx)("p", { className: "my-1 text-xs text-gray-500 dark:text-neutral-400 italic", children: conversionHint })), hint && ((0, jsx_runtime_1.jsx)("p", { className: (0, utils_1.classNames)("my-1 text-xs text-gray-700 dark:text-neutral-400", !!amountExceeded && "text-red-500 dark:text-red-500"), children: hint }))] }));
};
exports.default = DualCurrencyField;
