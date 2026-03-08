"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const TextField_1 = __importDefault(require("@components/form/TextField"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const initialErrors = {
    passwordErrorMessage: "",
    passwordConfirmationErrorMessage: "",
};
function PasswordForm({ formData, setFormData, i18nKeyPrefix, minLength, confirm = true, autoFocus = true, }) {
    const [errors, setErrors] = (0, react_1.useState)(initialErrors);
    const [passwordViewVisible, setPasswordViewVisible] = (0, react_1.useState)(false);
    const [passwordConfirmationViewVisible, setPasswordConfirmationViewVisible] = (0, react_1.useState)(false);
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: i18nKeyPrefix,
    });
    function handleChange(event) {
        if (event.target.name === "password" ||
            event.target.name === "passwordConfirmation") {
            setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
        }
        if (event.target.name === "password" && errors.passwordErrorMessage) {
            setErrors(Object.assign(Object.assign({}, errors), { passwordErrorMessage: "" }));
        }
        else if (event.target.name === "passwordConfirmation" &&
            errors.passwordConfirmationErrorMessage &&
            formData.password === event.target.value.trim()) {
            setErrors(Object.assign(Object.assign({}, errors), { passwordConfirmationErrorMessage: "" }));
        }
    }
    function validate() {
        let passwordErrorMessage = "";
        let passwordConfirmationErrorMessage = "";
        if (!formData.password)
            passwordErrorMessage = "enter_password";
        if (confirm && !formData.passwordConfirmation) {
            passwordConfirmationErrorMessage = "confirm_password";
        }
        else if (confirm && formData.password !== formData.passwordConfirmation) {
            passwordConfirmationErrorMessage = "mismatched_password";
        }
        setErrors({
            passwordErrorMessage,
            passwordConfirmationErrorMessage,
        });
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "w-full mt-8", children: [(0, jsx_runtime_1.jsx)(TextField_1.default, { autoFocus: autoFocus, id: "password", 
                        // @ts-ignore/currently ignore
                        label: t("choose_password.label"), type: passwordViewVisible ? "text" : "password", required: true, onChange: handleChange, minLength: minLength, pattern: minLength ? `.{${minLength},}` : undefined, title: minLength
                            ? `at least ${minLength} characters`
                            : undefined /*TODO: i18n */, onBlur: validate, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                setPasswordViewVisible(passwordView);
                            } }) }), errors.passwordErrorMessage && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-red-500", children: t(`errors.${errors.passwordErrorMessage}`) }))] }), confirm && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-6 w-full", children: [(0, jsx_runtime_1.jsx)(TextField_1.default, { id: "passwordConfirmation", label: t("confirm_password.label"), type: passwordConfirmationViewVisible ? "text" : "password", required: true, onChange: handleChange, onBlur: validate, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                setPasswordConfirmationViewVisible(passwordView);
                            } }) }), errors.passwordConfirmationErrorMessage && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-red-500", children: t(`errors.${errors.passwordConfirmationErrorMessage}`) }))] }))] }));
}
exports.default = PasswordForm;
