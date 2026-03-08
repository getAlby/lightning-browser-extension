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
const Container_1 = __importDefault(require("@components/Container"));
const LocaleSwitcher_1 = __importDefault(require("@components/LocaleSwitcher/LocaleSwitcher"));
const PasswordForm_1 = __importDefault(require("@components/PasswordForm"));
const Setting_1 = __importDefault(require("@components/Setting"));
const Input_1 = __importDefault(require("@components/form/Input"));
const Select_1 = __importDefault(require("@components/form/Select"));
const Toggle_1 = __importDefault(require("@components/form/Toggle"));
const html5_qrcode_1 = require("html5-qrcode");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const Modal_1 = __importDefault(require("~/app/components/Modal"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const initialFormData = {
    password: "",
    passwordConfirmation: "",
};
function Settings() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "settings" });
    const { isLoading, settings, updateSetting } = (0, SettingsContext_1.useSettings)();
    const [modalIsOpen, setModalIsOpen] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [cameraPermissionsGranted, setCameraPermissionsGranted] = (0, react_1.useState)(false);
    function closeModal() {
        setModalIsOpen(false);
    }
    function updateAccountPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield msg_1.default.request("changePassword", {
                    password: formData.password,
                });
                Toast_1.default.success(t("change_password.success"));
                closeModal();
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`An unexpected error occurred: ${e.message}`);
            }
        });
    }
    function saveSetting(setting) {
        return __awaiter(this, void 0, void 0, function* () {
            // ensure to update SettingsContext
            updateSetting(setting);
        });
    }
    return ((0, jsx_runtime_1.jsx)(Container_1.default, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-12 mt-12", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold dark:text-white leading-8", children: t("title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400 text-sm leading-5", children: t("subtitle") })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white leading-7", children: t("general.title") }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp", children: [(0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("browser_notifications.title"), subtitle: t("browser_notifications.subtitle"), inline: true, children: !isLoading && ((0, jsx_runtime_1.jsx)(Toggle_1.default, { checked: settings.browserNotifications, onChange: () => {
                                                    saveSetting({
                                                        browserNotifications: !settings.browserNotifications,
                                                    });
                                                } })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("website_enhancements.title"), subtitle: t("website_enhancements.subtitle"), inline: true, children: !isLoading && ((0, jsx_runtime_1.jsx)(Toggle_1.default, { checked: settings.websiteEnhancements, onChange: () => {
                                                    saveSetting({
                                                        websiteEnhancements: !settings.websiteEnhancements,
                                                    });
                                                } })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("camera_access.title"), subtitle: t("camera_access.subtitle"), children: !cameraPermissionsGranted ? ((0, jsx_runtime_1.jsx)(Button_1.default, { label: t("camera_access.allow"), className: "sm:w-64 flex-none w-full mt-4 sm:mt-0", onClick: () => __awaiter(this, void 0, void 0, function* () {
                                                    try {
                                                        yield html5_qrcode_1.Html5Qrcode.getCameras();
                                                        setCameraPermissionsGranted(true);
                                                    }
                                                    catch (e) {
                                                        if (e instanceof Error)
                                                            Toast_1.default.error(e.message);
                                                    }
                                                }) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-green-500 font-medium pt-2 sm:pt-0", children: t("camera_access.granted") })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("language.title"), subtitle: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "language.subtitle", t: t, components: [
                                                    // eslint-disable-next-line react/jsx-key
                                                    (0, jsx_runtime_1.jsx)("a", { className: "underline", target: "_blank", rel: "noreferrer noopener", href: "https://hosted.weblate.org/projects/getalby-lightning-browser-extension/getalby-lightning-browser-extension/" }),
                                                ] }), children: (0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(LocaleSwitcher_1.default, { className: "w-full border-gray-300 rounded-md shadow-sm text-gray-700 bg-white dark:bg-surface-00dp dark:text-neutral-200 dark:border-neutral-800" }) }) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("theme.title"), subtitle: t("theme.subtitle"), children: !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 flex-none w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsxs)(Select_1.default, { name: "theme", value: settings.theme, onChange: (event) => __awaiter(this, void 0, void 0, function* () {
                                                        yield saveSetting({
                                                            theme: event.target.value,
                                                        });
                                                    }), children: [(0, jsx_runtime_1.jsx)("option", { value: "dark", children: t("theme.options.dark") }), (0, jsx_runtime_1.jsx)("option", { value: "light", children: t("theme.options.light") }), (0, jsx_runtime_1.jsx)("option", { value: "system", children: t("theme.options.system") })] }) })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("change_password.title"), subtitle: t("change_password.subtitle"), children: !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => {
                                                        setModalIsOpen(true);
                                                    }, label: t("change_password.title"), primary: true, fullWidth: true, loading: isLoading, disabled: isLoading }) })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("show_fiat.title"), subtitle: t("show_fiat.subtitle"), inline: true, children: !isLoading && ((0, jsx_runtime_1.jsx)(Toggle_1.default, { checked: settings.showFiat, onChange: () => {
                                                    saveSetting({
                                                        showFiat: !settings.showFiat,
                                                    });
                                                } })) }), settings.showFiat && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("currency.title"), subtitle: t("currency.subtitle"), children: !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Select_1.default, { name: "currency", value: settings.currency, onChange: (event) => __awaiter(this, void 0, void 0, function* () {
                                                                yield saveSetting({
                                                                    currency: event.target.value,
                                                                });
                                                            }), children: Object.keys(constants_1.CURRENCIES).map((currency) => ((0, jsx_runtime_1.jsx)("option", { value: currency, children: currency }, currency))) }) })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("exchange.title"), subtitle: t("exchange.subtitle"), children: !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsxs)(Select_1.default, { name: "exchange", value: settings.exchange, onChange: (event) => __awaiter(this, void 0, void 0, function* () {
                                                                // exchange/value change should be reflected in the upper account-menu after select?
                                                                yield saveSetting({
                                                                    exchange: event.target.value,
                                                                });
                                                            }), children: [(0, jsx_runtime_1.jsx)("option", { value: "alby", children: "Alby" }), (0, jsx_runtime_1.jsx)("option", { value: "coindesk", children: "Coindesk" }), (0, jsx_runtime_1.jsx)("option", { value: "yadio", children: "yadio" })] }) })) })] }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white", children: t("personal_data.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400 text-sm", children: t("personal_data.description") })] }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden mb-5 px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp", children: [(0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("name.title"), subtitle: t("name.subtitle"), children: !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 w-full mt-1 sm:mt-0", children: (0, jsx_runtime_1.jsx)(Input_1.default, { placeholder: t("name.placeholder"), value: settings.userName, onChange: (event) => {
                                                saveSetting({
                                                    userName: event.target.value,
                                                });
                                            } }) })) }), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("email.title"), subtitle: t("email.subtitle"), children: !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 w-full mt-1 sm:mt-0", children: (0, jsx_runtime_1.jsx)(Input_1.default, { placeholder: t("email.placeholder"), type: "email", value: settings.userEmail, onChange: (event) => {
                                                saveSetting({
                                                    userEmail: event.target.value,
                                                });
                                            } }) })) }), (0, jsx_runtime_1.jsx)(Modal_1.default, { isOpen: modalIsOpen, close: closeModal, contentLabel: t("change_password.screen_reader"), title: t("change_password.title"), children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                                            e.preventDefault();
                                            updateAccountPassword(formData.password);
                                        }, children: [(0, jsx_runtime_1.jsx)(PasswordForm_1.default, { i18nKeyPrefix: "settings.change_password", formData: formData, setFormData: setFormData }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-6", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("change_password.submit.label"), type: "submit", primary: true, disabled: !formData.password ||
                                                        formData.password !== formData.passwordConfirmation }) })] }) })] })] })] }) }));
}
exports.default = Settings;
