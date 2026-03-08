"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const Checkbox_1 = __importDefault(require("@components/form/Checkbox"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
function BitcoinConfirmGetAddress() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "bitcoin",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t: tPermissions } = (0, react_i18next_1.useTranslation)("permissions");
    const navState = (0, useNavigationState_1.useNavigationState)();
    const origin = navState.origin;
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [rememberPermission, setRememberPermission] = (0, react_2.useState)(true);
    function confirm() {
        setLoading(true);
        msg_1.default.reply({
            confirm: true,
            rememberPermission,
            blocked: false,
        });
        setLoading(false);
    }
    function reject(event) {
        event.preventDefault();
        msg_1.default.error(constants_1.USER_REJECTED_ERROR);
    }
    function block(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            yield msg_1.default.request("addBlocklist", {
                domain: origin.domain,
                host: origin.host,
            });
            alert(t("block_added", { host: origin.host }));
            msg_1.default.error(constants_1.USER_REJECTED_ERROR);
        });
    }
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("confirm_get_address.title") }), (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host, isSmall: false }), (0, jsx_runtime_1.jsxs)("div", { className: "dark:text-white pt-6 mb-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-2", children: t("allow") }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 flex items-center", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCheckLine, { className: "w-5 h-5 mr-2" }), (0, jsx_runtime_1.jsx)("p", { className: "dark:text-white", children: tPermissions("bitcoin.getaddress.description") })] })] })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)(Checkbox_1.default, { id: "remember_permission", name: "remember_permission", checked: rememberPermission, onChange: (event) => {
                                            setRememberPermission(event.target.checked);
                                        } }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "remember_permission", className: "cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white", children: tCommon("actions.remember") })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col", children: [(0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, label: tCommon("actions.confirm"), onCancel: reject }), (0, jsx_runtime_1.jsx)("a", { className: "mt-4 underline text-sm text-gray-400 mx-4 overflow-hidden text-ellipsis whitespace-nowrap", href: "#", onClick: block, children: t("block_and_ignore", { host: origin.host }) })] })] })] })] }));
}
exports.default = BitcoinConfirmGetAddress;
