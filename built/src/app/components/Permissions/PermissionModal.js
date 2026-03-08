"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const Button_1 = __importDefault(require("~/app/components/Button"));
const Modal_1 = __importDefault(require("~/app/components/Modal"));
const PublisherCard_1 = __importDefault(require("~/app/components/PublisherCard"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const utils_1 = require("~/app/utils");
const types_1 = require("~/types");
function PermissionModal({ isOpen, onClose, permissionCallback, permission, }) {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "permissions_modal",
    });
    const navState = (0, useNavigationState_1.useNavigationState)();
    const [permissionOption, setPermissionOption] = (0, react_1.useState)(types_1.PermissionOption.ASK_EVERYTIME);
    const origin = navState.origin;
    return ((0, jsx_runtime_1.jsx)(Modal_1.default, { isOpen: isOpen, close: () => {
            onClose();
        }, contentLabel: t("content_label"), position: "top", children: (0, jsx_runtime_1.jsxs)("div", { className: "dark:text-white mt-6", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host, isSmall: false, isCard: false }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 py-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-md", children: t("set_permissions") }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)(ListItem, { checkedValue: types_1.PermissionOption.ASK_EVERYTIME }), (0, jsx_runtime_1.jsx)(ListItem, { checkedValue: types_1.PermissionOption.DONT_ASK_CURRENT }), (0, jsx_runtime_1.jsx)(ListItem, { checkedValue: types_1.PermissionOption.DONT_ASK_ANY })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex mt-5", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: tCommon("actions.save"), primary: true, flex: true, onClick: () => permissionCallback(permissionOption) }) })] })] }) }));
    function ListItem({ checkedValue }) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row gap-2 items-center py-1", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", id: checkedValue, name: "permission", value: "permission", checked: permissionOption === checkedValue, onChange: () => {
                        setPermissionOption(checkedValue);
                    }, className: (0, utils_1.classNames)("border border-gray-200 dark:border-neutral-700 cursor-pointer text-primary focus:ring-0 focus:ring-offset-0", permissionOption !== checkedValue
                        ? "bg-white dark:bg-surface-01dp"
                        : "") }), (0, jsx_runtime_1.jsx)("label", { htmlFor: checkedValue, className: "text-sm text-gray-600 dark:text-neutral-400 cursor-pointer", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: checkedValue, t: t, values: { permission }, components: [
                            // eslint-disable-next-line react/jsx-key
                            (0, jsx_runtime_1.jsx)("b", {}),
                        ] }) })] }));
    }
}
exports.default = PermissionModal;
