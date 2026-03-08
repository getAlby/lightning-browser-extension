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
const Button_1 = __importDefault(require("@components/Button"));
const PasswordForm_1 = __importDefault(require("@components/PasswordForm"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const initialFormData = {
    password: "",
    passwordConfirmation: "",
};
function SetPassword() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [formData, setFormData] = (0, react_2.useState)(initialFormData);
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "welcome.set_password",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            try {
                yield msg_1.default.request("setPassword", { password: formData.password });
                navigate("/choose-path");
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error(e.message);
                    Toast_1.default.error(`Error: ${e.message}`);
                }
            }
        });
    }
    const unlockScreenshot = ((0, jsx_runtime_1.jsx)("img", { src: "assets/images/unlock_passcode.png", alt: "Unlock screen" }));
    return ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-xl rounded-2xl mx-auto relative lg:flex lg:space-x-8 bg-white dark:bg-surface-02dp pt-10 pb-10 px-10 border border-gray-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold dark:text-white text-center", children: t("title") }), (0, jsx_runtime_1.jsx)("div", { className: "w-full flex justify-center my-8 short:hidden", children: unlockScreenshot }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row text-gray-500 my-4 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsLockOpenLine, { className: "w-6 h-6 mr-2" }), t("description1")] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row text-gray-500 my-4 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-6 h-6 mr-2" }), t("description2")] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(PasswordForm_1.default, { i18nKeyPrefix: "welcome.set_password", formData: formData, setFormData: setFormData }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-8 flex justify-center", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: tCommon("actions.next"), type: "submit", primary: true, disabled: !formData.password ||
                                formData.password !== formData.passwordConfirmation, className: "w-64" }) })] }) }) }));
}
exports.default = SetPassword;
