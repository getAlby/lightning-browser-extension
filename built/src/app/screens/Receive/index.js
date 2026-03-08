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
const Container_1 = __importDefault(require("@components/Container"));
const Header_1 = __importDefault(require("@components/Header"));
const IconButton_1 = __importDefault(require("@components/IconButton"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Avatar_1 = __importDefault(require("~/app/components/Avatar"));
const QRCode_1 = __importDefault(require("~/app/components/QRCode"));
const SkeletonLoader_1 = __importDefault(require("~/app/components/SkeletonLoader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const IconLinkCard_1 = require("../../components/IconLinkCard/IconLinkCard");
function Receive() {
    var _a;
    const auth = (0, AccountContext_1.useAccount)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "receive" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const [loadingLightningAddress, setLoadingLightningAddress] = (0, react_2.useState)(true);
    const [lightningAddress, setLightningAddress] = (0, react_2.useState)("");
    const isAlbyOAuthUser = (0, utils_1.isAlbyOAuthAccount)((_a = auth.account) === null || _a === void 0 ? void 0 : _a.connectorType);
    (0, react_2.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (!auth.account)
                return;
            const accountInfo = yield api_1.default.swr.getAccountInfo(auth.account.id);
            const lightningAddress = accountInfo.lightningAddress;
            if (lightningAddress)
                setLightningAddress(lightningAddress);
            setLoadingLightningAddress(false);
        }))();
    }, [auth.account]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => {
                        navigate(-1);
                    }, icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), (0, jsx_runtime_1.jsx)("div", { className: "pt-4", children: (0, jsx_runtime_1.jsx)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 md:gap-3", children: [isAlbyOAuthUser && ((0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-surface-01dp border-gray-200 dark:border-neutral-700 rounded border p-4 flex flex-col justify-center items-center gap-1 text-gray-800 dark:text-neutral-200", children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "relative flex flex-grid", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-32 h-32 md:w-48 md:h-48", children: [loadingLightningAddress ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { className: "w-32 h-32 relative -top-1" })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(QRCode_1.default, { className: "rounded-md", value: lightningAddress, size: 192, level: "Q" }) })), !auth.accountLoading && auth.account ? ((0, jsx_runtime_1.jsx)(Avatar_1.default, { size: 40, className: "border-4 border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1 bg-white", url: auth.account.avatarUrl, name: auth.account.id })) : (auth.accountLoading && ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { circle: true, opaque: false, className: "w-[40px] h-[40px] border-4 border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1 opacity-100" })))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1 text-xs md:text-sm leading-4 font-medium", children: loadingLightningAddress ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { className: "w-40 relative" })) : ((0, jsx_runtime_1.jsxs)("a", { className: "flex flex-row items-center cursor-pointer", onClick: () => {
                                                    navigator.clipboard.writeText(lightningAddress);
                                                    Toast_1.default.success(tCommon("copied"));
                                                }, children: [lightningAddress, (0, jsx_runtime_1.jsx)(react_1.PopiconsCopyLine, { className: "w-4 h-4" })] })) })] }) })), (0, jsx_runtime_1.jsx)(IconLinkCard_1.IconLinkCard, { title: t("actions.invoice.title"), description: t("actions.invoice.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsBoltLine, { className: "w-8 h-8" }), onClick: () => {
                                    navigate("/receive/invoice");
                                } }), (0, jsx_runtime_1.jsx)(IconLinkCard_1.IconLinkCard, { title: t("actions.redeem.title"), description: t("actions.redeem.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsWithdrawalLine, { className: "w-8 h-8" }), onClick: () => {
                                    navigate("/lnurlRedeem");
                                } })] }) }) })] }));
}
exports.default = Receive;
