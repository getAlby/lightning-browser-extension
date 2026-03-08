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
const ContentMessage_1 = __importDefault(require("@components/ContentMessage"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const os_1 = __importDefault(require("~/common/utils/os"));
function ConfirmAddAccount() {
    var _a, _b, _c;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "confirm_add_account",
    });
    const name = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.name;
    const connector = (_b = navState.args) === null || _b === void 0 ? void 0 : _b.connector;
    const config = (_c = navState.args) === null || _c === void 0 ? void 0 : _c.config;
    const origin = navState.origin;
    const [loading, setLoading] = (0, react_1.useState)(false);
    const isTor = connector.startsWith("native");
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const response = yield msg_1.default.request("addAccount", { name, connector, config }, { origin });
                msg_1.default.reply(response);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`${tCommon("error")}: ${e.message}`);
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), isTor && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 rounded-md font-medium p-4 text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-900", children: (0, jsx_runtime_1.jsxs)("p", { children: [t("tor_info"), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsxs)(Hyperlink_1.default, { className: "text-white hover:text-gray-300", href: `https://getalby.com/install/companion/${(0, os_1.default)()}`, children: ["\u2B07\uFE0F ", tCommon("actions.download")] })] }) })), (0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: t("content", {
                                    connector: tCommon(`connectors.${connector}` /* Type hack */),
                                }), content: name })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onConfirm: confirm, onCancel: reject })] })] }));
}
exports.default = ConfirmAddAccount;
