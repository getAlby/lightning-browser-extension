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
const AlbyLogo_1 = __importDefault(require("@components/AlbyLogo"));
const Button_1 = __importDefault(require("@components/Button"));
const Container_1 = __importDefault(require("@components/Container"));
const Input_1 = __importDefault(require("@components/form/Input"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const AccountContext_1 = require("~/app/context/AccountContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
function Unlock() {
    var _a;
    const [password, setPassword] = (0, react_1.useState)("");
    const [passwordViewVisible, setPasswordViewVisible] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const navState = (0, useNavigationState_1.useNavigationState)();
    const location = (0, react_router_dom_1.useLocation)();
    const auth = (0, AccountContext_1.useAccount)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "unlock" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const from = ((_a = location.state.from) === null || _a === void 0 ? void 0 : _a.pathname) || "/";
    function handlePasswordChange(event) {
        setError("");
        setPassword(event.target.value);
    }
    function handleSubmit(event) {
        unlock();
        event.preventDefault();
    }
    function reset(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            yield msg_1.default.request("reset");
            utils_1.default.openPage("welcome.html");
        });
    }
    function unlock() {
        setLoading(true);
        auth
            .unlock(password, () => {
            if (navState.action === "unlock") {
                msg_1.default.reply({ unlocked: true });
                return;
            }
            navigate(from, { replace: true });
            setLoading(false);
        })
            .catch((e) => {
            setError(e.message);
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsx)(Container_1.default, { maxWidth: "sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-64 mt-4 dark:text-white", children: (0, jsx_runtime_1.jsx)(AlbyLogo_1.default, {}) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-center text-xl font-normal font-serif mt-8 mb-5 dark:text-white", children: t("unlock_to_continue") }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-5", children: [(0, jsx_runtime_1.jsx)(Input_1.default, { placeholder: t("unlock_password"), type: passwordViewVisible ? "text" : "password", autoFocus: true, value: password, onChange: handlePasswordChange, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                            setPasswordViewVisible(passwordView);
                                        } }) }), error && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-red-500", children: error }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-gray-500", children: t("unlock_error.help") }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1", children: (0, jsx_runtime_1.jsx)("a", { href: "#", className: "text-gray-500 underline ", onClick: reset, children: t("unlock_error.link") }) })] }))] }), (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: tCommon("actions.unlock"), fullWidth: true, primary: true, loading: loading, disabled: loading || password === "" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center col space-x-1 mt-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-gray-500", children: [t("help_contact.part1"), " "] }), (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { className: "font-medium", href: "mailto:support@getalby.com", children: t("help_contact.part2") })] })] })] }) }));
}
exports.default = Unlock;
