"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SettingsContext_1 = require("~/app/context/SettingsContext");
/**
 * UnifiedAmount Component
 *
 * Centralizes the display of BTC/Sats and Fiat values.
 * Uses SettingsContext for rates and formatting preferences.
 *
 * Quality features:
 * - Skeleton loading state
 * - Defensive validation against NaN/invalid inputs
 * - Professional layout with secondary value support
 */
const UnifiedAmount = ({ sats, className = "", primary = "sats", showSecondary = true, }) => {
    const { settings, getFormattedFiat, getFormattedSats, isLoading } = (0, SettingsContext_1.useSettings)();
    const [fiatValue, setFiatValue] = (0, react_1.useState)(null);
    const amountSats = Number(sats);
    // Defensive validation: ensure finite number before formatting
    const safeSats = Number.isFinite(amountSats) ? amountSats : 0;
    const formattedSats = getFormattedSats(safeSats);
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        if (settings.showFiat && safeSats > 0) {
            getFormattedFiat(safeSats).then((val) => {
                if (isMounted)
                    setFiatValue(val);
            });
        }
        else {
            setFiatValue(null);
        }
        return () => {
            isMounted = false;
        };
    }, [safeSats, settings.showFiat, getFormattedFiat]);
    if (isLoading)
        return ((0, jsx_runtime_1.jsx)("span", { className: "animate-pulse bg-gray-200 rounded w-16 h-4 inline-block" }));
    const fiatActive = settings.showFiat && fiatValue;
    const renderPrimary = () => {
        if (primary === "fiat" && fiatActive) {
            return (0, jsx_runtime_1.jsx)("span", { className: "font-bold", children: fiatValue });
        }
        return (0, jsx_runtime_1.jsx)("span", { className: "font-bold", children: formattedSats });
    };
    const renderSecondary = () => {
        if (!showSecondary)
            return null;
        if (primary === "sats" && fiatActive) {
            return (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-500 text-sm ml-1", children: ["(", fiatValue, ")"] });
        }
        if (primary === "fiat" && fiatActive) {
            return ((0, jsx_runtime_1.jsxs)("span", { className: "text-gray-500 text-sm ml-1", children: ["(", formattedSats, ")"] }));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `inline-flex items-baseline ${className}`, children: [renderPrimary(), renderSecondary()] }));
};
exports.default = UnifiedAmount;
