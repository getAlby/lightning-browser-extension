"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeLabel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
const SettingsContext_1 = require("~/app/context/SettingsContext");
function RangeLabel({ min, max }) {
    const { t } = (0, react_i18next_1.useTranslation)("common");
    const { getFormattedNumber } = (0, SettingsContext_1.useSettings)();
    if (min && max) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: t("range.between", {
                min: getFormattedNumber(min),
                max: getFormattedNumber(max),
            }) }));
    }
    else if (min) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: t("range.greaterOrEqual", { min: getFormattedNumber(min) }) });
    }
    else if (max) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: t("range.lessThanOrEqual", { max: getFormattedNumber(max) }) });
    }
    else {
        return null;
    }
}
exports.RangeLabel = RangeLabel;
