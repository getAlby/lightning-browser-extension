"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const PinExtension_1 = __importDefault(require("@screens/Onboard/PinExtension"));
const SetPassword_1 = __importDefault(require("@screens/Onboard/SetPassword"));
const TestConnection_1 = __importDefault(require("@screens/Onboard/TestConnection"));
const ChooseConnector_1 = __importDefault(require("@screens/connectors/ChooseConnector"));
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Container_1 = __importDefault(require("~/app/components/Container"));
const LocaleSwitcher_1 = __importDefault(require("~/app/components/LocaleSwitcher/LocaleSwitcher"));
const Toaster_1 = __importDefault(require("~/app/components/Toast/Toaster"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const PinMeHereIcon_1 = __importDefault(require("~/app/icons/PinMeHereIcon"));
const connectorRoutes_1 = require("~/app/router/connectorRoutes");
const ChooseConnectorPath_1 = __importDefault(require("~/app/screens/connectors/ChooseConnectorPath"));
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
const connectorRoutes = (0, connectorRoutes_1.getConnectorRoutes)();
function Welcome() {
    return ((0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(AccountContext_1.AccountProvider, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.HashRouter, { children: [(0, jsx_runtime_1.jsx)(Toaster_1.default, {}), (0, jsx_runtime_1.jsx)(react_router_dom_1.Routes, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Layout, {}), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(SetPassword_1.default, {}) }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "choose-path", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(ChooseConnectorPath_1.default, {}) }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "choose-connector", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(ChooseConnector_1.default, { title: i18nConfig_1.default.t("translation:choose_connector.title"), description: i18nConfig_1.default.t("translation:choose_connector.description"), connectorRoutes: connectorRoutes }) }), (0, connectorRoutes_1.renderRoutes)(connectorRoutes)] })] }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "test-connection", element: (0, jsx_runtime_1.jsx)(TestConnection_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "pin-extension", element: (0, jsx_runtime_1.jsx)(PinExtension_1.default, {}) })] }) })] }) }) }));
}
function Layout() {
    const [languageChanged, setLanguageChanged] = (0, react_1.useState)(false);
    const [isPinScreen, setPinScreen] = (0, react_1.useState)(false);
    const location = (0, react_router_dom_1.useLocation)();
    i18nConfig_1.default.on("languageChanged", () => {
        // Trigger rerender to update displayed language
        setLanguageChanged(!languageChanged);
    });
    // Check if the current path is the pin-extension screen
    (0, react_1.useEffect)(() => {
        const checkHash = () => {
            const isPinExtensionScreen = location.pathname.includes("pin-extension");
            setPinScreen(isPinExtensionScreen);
        };
        checkHash();
    }, [location]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col min-h-screen", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex ml-6 mr-[8%]", children: [(0, jsx_runtime_1.jsx)(LocaleSwitcher_1.default, { className: "absolute left-0 top-4 text-sm text-gray-600 hover:text-gray-700 bg-gray-100 dark:bg-surface-00dp dark:text-neutral-400 dark:hover:text-neutral-300 border-transparent" }), isPinScreen && ((0, jsx_runtime_1.jsx)(PinMeHereIcon_1.default, { className: "hidden md:block ml-auto mt-3 text-gray-600 dark:text-gray-400" }))] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-1 justify-center items-center", children: (0, jsx_runtime_1.jsx)(Container_1.default, { maxWidth: "xl", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}) }) })] }));
}
exports.default = Welcome;
