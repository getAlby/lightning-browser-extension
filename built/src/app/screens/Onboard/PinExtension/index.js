"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = __importDefault(require("@components/Button"));
const react_i18next_1 = require("react-i18next");
const utils_1 = require("~/app/utils");
const utils_2 = __importDefault(require("~/common/lib/utils"));
const os_1 = __importDefault(require("~/common/utils/os"));
function PinExtension() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "welcome.pin_extension",
    });
    const onNext = () => {
        utils_2.default.redirectPage("options.html#/wallet");
    };
    const theme = (0, utils_1.useTheme)();
    const getImage = () => {
        return ((0, jsx_runtime_1.jsx)("img", { src: theme === "dark"
                ? "assets/images/pin_extension_dark.png"
                : "assets/images/pin_extension_light.png", alt: "Pin your Alby extension", className: "h-64" }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center text-lg ", children: [(0, jsx_runtime_1.jsx)("div", { className: "shadow-lg rounded-xl bg-white dark:bg-surface-02dp p-10 md:max-w-xl w-full mx-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "md:max-w-[512px] mx-auto", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl  font-bold dark:text-white text-center", children: t("title") }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col  items-center mt-4 max-w-[396px] w-full mx-auto", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: getImage() }), (0, jsx_runtime_1.jsx)("div", { className: "text-gray-500 mt-8 dark:text-gray-400 text-sm", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "explanation", t: t, components: [
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/extension.svg", className: "w-5 inline dark:invert mr-2" }),
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)("span", { className: "block h-5" }),
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/keyboard.svg", className: "w-5 inline dark:invert mr-2" }),
                                        ] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex w-full md:max-w-[152px] justify-center gap-3 mt-8", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-black dark:text-white text-xl rounded-xl py-4 px-6 border-2 border-gray-200 dark:border-gray-800 font-bold", children: (0, os_1.default)() === "MacOS"
                                                ? t("keyboard_shortcut.mac_modifier_key")
                                                : t("keyboard_shortcut.windows_modifier_key") }), (0, jsx_runtime_1.jsx)("p", { className: "text-black dark:text-white text-xl rounded-xl py-4 px-6 border-2 border-gray-200 dark:border-gray-800 font-bold", children: t("keyboard_shortcut.second_key") })] })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex md:hidden my-8 justify-center", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("next_btn", { icon: "🐝" }), primary: true, onClick: onNext }) })] }));
}
exports.default = PinExtension;
