"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const Checkbox_1 = __importDefault(require("@components/form/Checkbox"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const ConfirmRequestPermission = () => {
    var _a, _b, _c, _d;
    const [alwaysAllow, setAlwaysAllow] = (0, react_1.useState)(false);
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "confirm_request_permission",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t: tPermissions } = (0, react_i18next_1.useTranslation)("permissions");
    const navState = (0, useNavigationState_1.useNavigationState)();
    const origin = navState.origin;
    const requestMethod = (_b = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.requestPermission) === null || _b === void 0 ? void 0 : _b.method;
    const description = (_d = (_c = navState.args) === null || _c === void 0 ? void 0 : _c.requestPermission) === null || _d === void 0 ? void 0 : _d.description;
    const enable = () => {
        msg_1.default.reply({
            enabled: alwaysAllow,
            blocked: false,
        });
    };
    const reject = (event) => {
        event.preventDefault();
        msg_1.default.error(constants_1.USER_REJECTED_ERROR);
    };
    function handleSubmit(event) {
        event.preventDefault();
        enable();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host, isSmall: false }), (0, jsx_runtime_1.jsxs)("div", { className: "dark:text-white pt-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-4", children: t("allow") }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 center dark:text-white", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold", children: requestMethod }), description && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-700 dark:text-neutral-500", children: tPermissions(description) }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)(Checkbox_1.default, { id: "always_allow", name: "always_allow", checked: alwaysAllow, onChange: () => setAlwaysAllow((prev) => !prev) }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "always_allow", className: "cursor-pointer pl-2 block text-sm text-gray-900 font-medium dark:text-white", children: t("always_allow") })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { label: tCommon("actions.confirm"), onCancel: reject })] })] }) })] }));
};
exports.default = ConfirmRequestPermission;
