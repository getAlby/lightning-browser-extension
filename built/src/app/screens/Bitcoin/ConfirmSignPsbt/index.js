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
const SuccessMessage_1 = __importDefault(require("@components/SuccessMessage"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const Loading_1 = __importDefault(require("~/app/components/Loading"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function ConfirmSignPsbt() {
    var _a;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "bitcoin.confirm_sign_psbt",
    });
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { getFormattedSats } = (0, SettingsContext_1.useSettings)();
    const psbt = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.psbt;
    const origin = navState.origin;
    const [loading, setLoading] = (0, react_2.useState)(true);
    const [successMessage, setSuccessMessage] = (0, react_2.useState)("");
    const [preview, setPreview] = (0, react_2.useState)(undefined);
    const [showAddresses, setShowAddresses] = (0, react_2.useState)(false);
    const [showHex, setShowHex] = (0, react_2.useState)(false);
    (0, react_2.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const preview = yield api_1.default.bitcoin.getPsbtPreview(psbt);
                setPreview(preview);
                setLoading(false);
            }
            catch (e) {
                console.error(e);
                const error = e;
                const errorMessage = error.message || "Unknown error";
                Toast_1.default.error(`${tCommon("error")}: ${errorMessage}`);
            }
        }))();
    }, [origin, psbt, tCommon]);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const response = yield api_1.default.bitcoin.signPsbt(psbt);
                msg_1.default.reply(response);
                setSuccessMessage(tCommon("success"));
            }
            catch (e) {
                console.error(e);
                const error = e;
                const errorMessage = error.message || "Unknown error";
                Toast_1.default.error(`${tCommon("error")}: ${errorMessage}`);
            }
            finally {
                setLoading(false);
            }
        });
    }
    function reject(e) {
        e.preventDefault();
        msg_1.default.error(constants_1.USER_REJECTED_ERROR);
    }
    function close(e) {
        if (navState.isPrompt) {
            window.close();
        }
        else {
            e.preventDefault();
            navigate(-1);
        }
    }
    function toggleShowAddresses() {
        setShowAddresses((current) => !current);
    }
    function toggleShowHex() {
        setShowHex((current) => !current);
    }
    if (!preview) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex w-full h-full justify-center items-center", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 mb-4", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)("div", { className: "p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4", children: (0, jsx_runtime_1.jsx)("h2", { className: "font-medium dark:text-white", children: t("allow_sign", { host: origin.host }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex w-full justify-center items-center", onClick: toggleShowAddresses, children: [tCommon("details"), showAddresses ? ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronTopLine, { className: "h-4 w-4 inline-flex" })) : ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronBottomLine, { className: "h-4 w-4 inline-flex" }))] }), showAddresses && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium dark:text-white", children: t("inputs") }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col gap-4", children: preview.inputs.map((input) => ((0, jsx_runtime_1.jsx)(AddressPreview, Object.assign({ t: t }, input), input.address))) }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium dark:text-white", children: t("outputs") }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col gap-4", children: preview.outputs.map((output) => ((0, jsx_runtime_1.jsx)(AddressPreview, Object.assign({ t: t }, output), output.address))) }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium dark:text-white", children: t("fee") }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium text-sm text-gray-500 dark:text-gray-400", children: getFormattedSats(preview.fee) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex w-full justify-center", children: (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { onClick: toggleShowHex, children: showHex
                                                ? t("hide_raw_transaction")
                                                : t("view_raw_transaction") }) })] })), showHex && ((0, jsx_runtime_1.jsx)("div", { className: "break-all p-2 mb-4 shadow bg-white rounded-lg dark:bg-surface-02dp text-gray-500 dark:text-gray-400", children: psbt }))] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onConfirm: confirm, onCancel: reject })] })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)(SuccessMessage_1.default, { message: successMessage, onClose: close })] }))] }));
}
function AddressPreview({ address, amount, t, }) {
    const { getFormattedSats } = (0, SettingsContext_1.useSettings)();
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-gray-400 break-all", children: address }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium text-sm text-gray-500 dark:text-gray-400", children: getFormattedSats(amount) })] }));
}
exports.default = ConfirmSignPsbt;
