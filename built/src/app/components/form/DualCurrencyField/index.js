"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const utils_1 = require("~/app/utils");
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const rangeLabel_1 = require("./rangeLabel");
/**
 * Enhanced DualCurrencyField
 *
 * Supports seamless switching between Sats and Fiat input with high-precision
 * bidirectional syncing, mobile-optimized keyboards, and international formatting.
 */
function DualCurrencyField({ label, id, placeholder, required = false, pattern, title, onChange, onFocus, onBlur, fiatValue: controlledFiatValue, onFiatValueChange, value, // Sats value as string
autoFocus = false, autoComplete = "off", disabled, min, max, suffix, endAdornment, hint, amountExceeded, rangeExceeded, }) {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { settings, getCurrencyRate } = (0, SettingsContext_1.useSettings)();
    const [isFiatMode, setIsFiatMode] = (0, react_1.useState)(false);
    const [localFiatValue, setLocalFiatValue] = (0, react_1.useState)("");
    const [rate, setRate] = (0, react_1.useState)(null);
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    const inputEl = (0, react_1.useRef)(null);
    const rateRef = (0, react_1.useRef)(null);
    const onChangeRef = (0, react_1.useRef)(onChange);
    onChangeRef.current = onChange;
    // Constants for precision math
    const PRECISION = 1000000;
    // Initialize and sync currency rate
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        getCurrencyRate().then((res) => {
            if (isMounted) {
                setRate(res);
                rateRef.current = res;
            }
        });
        return () => {
            isMounted = false;
        };
    }, [getCurrencyRate, settings.currency]);
    // Normalize fiat input by stripping grouping separators and ensuring "." decimal point
    const normalizeFiatInput = (input) => {
        const lastComma = input.lastIndexOf(",");
        const lastDot = input.lastIndexOf(".");
        if (lastComma > lastDot) {
            // Comma is decimal separator (e.g. 1.000,50)
            return input.replace(/\./g, "").replace(",", ".");
        }
        else if (lastDot > lastComma) {
            // Dot is decimal separator (e.g. 1,000.50)
            return input.replace(/,/g, "");
        }
        return input.replace(",", ".");
    };
    // Sync Fiat field when Sats change (only if NOT focused/typing)
    (0, react_1.useEffect)(() => {
        if (!isFocused && !isFiatMode && rate && value) {
            const numericSats = parseInt(String(value));
            if (!isNaN(numericSats)) {
                const calculatedFiat = (numericSats / currencyConvert_1.numSatsInBtc) * rate;
                const formatted = calculatedFiat.toLocaleString(settings.locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                setLocalFiatValue(formatted);
                onFiatValueChange === null || onFiatValueChange === void 0 ? void 0 : onFiatValueChange(formatted);
            }
            else {
                setLocalFiatValue("");
                onFiatValueChange === null || onFiatValueChange === void 0 ? void 0 : onFiatValueChange("");
            }
        }
        else if (!value && !isFocused) {
            setLocalFiatValue("");
            onFiatValueChange === null || onFiatValueChange === void 0 ? void 0 : onFiatValueChange("");
        }
    }, [value, rate, isFiatMode, isFocused, onFiatValueChange, settings.locale]);
    // Support for externally controlled fiatValue
    (0, react_1.useEffect)(() => {
        if (controlledFiatValue !== undefined && !isFocused) {
            setLocalFiatValue(controlledFiatValue);
        }
    }, [controlledFiatValue, isFocused]);
    const handleFiatChange = (0, react_1.useCallback)((e) => {
        const rawInput = e.target.value;
        setLocalFiatValue(rawInput);
        onFiatValueChange === null || onFiatValueChange === void 0 ? void 0 : onFiatValueChange(rawInput);
        if (rateRef.current) {
            const sanitized = normalizeFiatInput(rawInput);
            const numericFiat = parseFloat(sanitized);
            if (!isNaN(numericFiat)) {
                // High precision math to avoid IEEE 754 drift
                const rateInt = Math.round(rateRef.current * PRECISION);
                const calculatedSats = Math.round((numericFiat * currencyConvert_1.numSatsInBtc * PRECISION) / rateInt);
                if (onChangeRef.current) {
                    const fakeEvent = Object.assign(Object.assign({}, e), { target: Object.assign(Object.assign({}, e.target), { value: calculatedSats.toString(), name: id }) });
                    onChangeRef.current(fakeEvent);
                }
            }
        }
    }, [id, onFiatValueChange]);
    const toggleMode = (e) => {
        e.preventDefault();
        setIsFiatMode(!isFiatMode);
        setTimeout(() => { var _a; return (_a = inputEl.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 0);
    };
    const internalOnFocus = (e) => {
        setIsFocused(true);
        onFocus === null || onFocus === void 0 ? void 0 : onFocus(e);
    };
    const internalOnBlur = (e) => {
        setIsFocused(false);
        onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
    };
    const conversionHint = (0, react_1.useMemo)(() => {
        if (!settings.showFiat || !rate)
            return null;
        if (isFiatMode) {
            return value ? `≈ ${value} Sats` : null;
        }
        else {
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
    const outerStyles = "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative block m-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center w-full", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: id, className: "font-medium text-gray-800 dark:text-white", children: label }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 items-center", children: [rate !== null && ((0, jsx_runtime_1.jsx)("button", { onClick: toggleMode, className: "text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors", title: isFiatMode ? "Switch to Sats" : "Switch to Fiat", children: isFiatMode ? "→ Sats" : `→ ${settings.currency}` })), (min !== undefined || max !== undefined) && ((0, jsx_runtime_1.jsxs)("span", { className: (0, utils_1.classNames)("text-xs text-gray-700 dark:text-neutral-400", !!rangeExceeded && "text-red-500 dark:text-red-500"), children: [(0, jsx_runtime_1.jsx)(rangeLabel_1.RangeLabel, { min: min, max: max }), " ", tCommon("sats_other")] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("flex items-center overflow-hidden field mt-1 px-3 py-1", "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1", !hint && "mb-2", (!!amountExceeded || !!rangeExceeded) &&
                    "border-red-500 dark:border-red-500", outerStyles), children: [(0, jsx_runtime_1.jsx)("input", { ref: inputEl, type: isFiatMode ? "text" : "number", inputMode: isFiatMode ? "decimal" : "numeric", name: id, id: id, className: (0, utils_1.classNames)("dual-currency-field", "block w-full placeholder-gray-500 dark:placeholder-gray-600 dark:text-white", "px-0 border-0 focus:ring-0 bg-transparent"), placeholder: isFiatMode ? "0.00" : placeholder || "0", required: required, pattern: pattern, title: title, onChange: isFiatMode ? handleFiatChange : onChange, onFocus: internalOnFocus, onBlur: internalOnBlur, value: isFiatMode ? localFiatValue : value, autoFocus: autoFocus, autoComplete: autoComplete, disabled: disabled, min: isFiatMode ? undefined : min, max: isFiatMode ? undefined : max }), conversionHint && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-sm whitespace-nowrap ml-2 pointer-events-none", children: conversionHint })), suffix && !conversionHint && ((0, jsx_runtime_1.jsx)("span", { className: "flex items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white", onClick: () => { var _a; return (_a = inputEl.current) === null || _a === void 0 ? void 0 : _a.focus(); }, children: suffix })), endAdornment && ((0, jsx_runtime_1.jsx)("span", { className: "flex items-center bg-white dark:bg-black dark:text-neutral-400 ml-2", children: endAdornment }))] }), hint && ((0, jsx_runtime_1.jsx)("p", { className: (0, utils_1.classNames)("my-1 text-xs text-gray-700 dark:text-neutral-400", !!amountExceeded && "text-red-500 dark:text-red-500"), children: hint }))] }));
}
exports.default = DualCurrencyField;
