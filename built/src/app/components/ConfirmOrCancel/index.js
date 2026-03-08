"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const Button_1 = __importDefault(require("~/app/components/Button"));
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
function ConfirmOrCancel({ disabled = false, loading = false, destructive = false, cancelLabel = i18nConfig_1.default.t("common:actions.cancel"), label = i18nConfig_1.default.t("common:actions.confirm"), onConfirm, onCancel, isFocused = true, }) {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const buttonRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        var _a;
        isFocused && ((_a = buttonRef === null || buttonRef === void 0 ? void 0 : buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus());
    }, [isFocused]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row justify-between", children: [(0, jsx_runtime_1.jsx)(Button_1.default, { onClick: onCancel, label: cancelLabel ? cancelLabel : tCommon("actions.cancel"), halfWidth: true, destructive: destructive, disabled: loading }), (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", ref: buttonRef, onClick: onConfirm, label: label, primary: true, disabled: disabled, loading: loading, halfWidth: true })] }));
}
exports.default = ConfirmOrCancel;
