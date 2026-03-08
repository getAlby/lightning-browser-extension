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
const Header_1 = __importDefault(require("@components/Header"));
const IconButton_1 = __importDefault(require("@components/IconButton"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const QrcodeAdornment_1 = __importDefault(require("~/app/components/QrcodeAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const utils_1 = require("~/app/utils");
const lnurl_1 = __importDefault(require("~/common/lib/lnurl"));
const typeHelpers_1 = require("~/common/utils/typeHelpers");
function LNURLRedeem() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "lnurlredeem" });
    const location = (0, react_router_dom_1.useLocation)();
    // location.state used to access the decoded QR coming from ScanQRCode screen
    const [lnurlWithdrawLink, setLnurlWithdrawLink] = (0, react_2.useState)(((_a = location.state) === null || _a === void 0 ? void 0 : _a.decodedQR) || "");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [loading, setLoading] = (0, react_2.useState)(false);
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            try {
                setLoading(true);
                const lnurl = lnurl_1.default.findLnurl(lnurlWithdrawLink);
                if (lnurl) {
                    const lnurlDetails = yield lnurl_1.default.getDetails(lnurl);
                    if ((0, typeHelpers_1.isLNURLDetailsError)(lnurlDetails)) {
                        Toast_1.default.error(lnurlDetails.reason);
                        return;
                    }
                    if (lnurlDetails.tag === "withdrawRequest") {
                        navigate("/lnurlWithdraw", {
                            state: {
                                args: {
                                    lnurlDetails,
                                },
                            },
                        });
                    }
                    else {
                        Toast_1.default.error(t("errors.invalid_withdraw_request"));
                        return;
                    }
                }
                else {
                    Toast_1.default.error(t("errors.invalid_lnurl"));
                    return;
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    Toast_1.default.error(e.message);
                }
            }
            finally {
                setLoading(false);
            }
        });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => navigate(-1), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "pt-4", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "lnurlwithdraw", label: t("input.label"), value: lnurlWithdrawLink, placeholder: t("input.placeholder"), disabled: loading, autoFocus: true, onChange: (event) => setLnurlWithdrawLink((0, utils_1.extractLightningTagData)(event.target.value.trim())), endAdornment: (0, jsx_runtime_1.jsx)(QrcodeAdornment_1.default, { route: "lnurlRedeem" }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: t("actions.withdraw"), primary: true, fullWidth: true, loading: loading, disabled: lnurlWithdrawLink === "" || loading }) })] }) })] }));
}
exports.default = LNURLRedeem;
