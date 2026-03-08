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
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const AccountContext_1 = require("~/app/context/AccountContext");
const icons_1 = require("~/app/icons");
const utils_1 = __importDefault(require("~/common/lib/utils"));
const react_1 = require("@popicons/react");
const Menu_1 = __importDefault(require("../Menu"));
function UserMenu() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const auth = (0, AccountContext_1.useAccount)();
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    function openOptions(path) {
        // if we are in the popup
        if (window.location.pathname !== "/options.html") {
            utils_1.default.openPage(`options.html#/${path}`);
            // close the popup
            window.close();
        }
        else {
            navigate(`/${path}`);
        }
    }
    function lock() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                auth.lock(() => {
                    window.close();
                });
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    return ((0, jsx_runtime_1.jsxs)(Menu_1.default, { as: "div", className: "relative", children: [(0, jsx_runtime_1.jsx)(Menu_1.default.Button, { className: "flex items-center text-gray-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-200", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsBarsSolid, { className: "h-4 w-4 text-gray-800 dark:text-neutral-200" }) }), (0, jsx_runtime_1.jsxs)(Menu_1.default.List, { position: "left", children: [auth.account && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                                    var _a;
                                    openOptions(`accounts/${(_a = auth.account) === null || _a === void 0 ? void 0 : _a.id}`);
                                }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsSettingsMinimalLine, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("active_wallet_settings")] }), (0, jsx_runtime_1.jsx)(Menu_1.default.Divider, {})] })), (0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                            openOptions("settings");
                        }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCogLine, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("settings")] }), (0, jsx_runtime_1.jsxs)("div", { className: "lg:hidden", children: [(0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                                    openOptions("publishers");
                                }, children: [(0, jsx_runtime_1.jsx)(icons_1.ConnectedSiteIcon, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("connected_sites")] }), (0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                                    openOptions("wallet");
                                }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsExpandLine, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("full_screen")] })] }), (0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                            utils_1.default.openUrl("https://feedback.getalby.com");
                        }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCommentLine, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("feedback")] }), (0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                            utils_1.default.openUrl("https://guides.getalby.com/user-guide/browser-extension");
                        }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsBulbLine, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("help")] }), (0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: lock, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsLockLine, { className: "h-4 w-4 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" }), tCommon("actions.lock")] })] })] }));
}
exports.default = UserMenu;
