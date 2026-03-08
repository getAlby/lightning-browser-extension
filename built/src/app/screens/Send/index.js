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
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const QrcodeAdornment_1 = __importDefault(require("~/app/components/QrcodeAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const utils_1 = require("~/app/utils");
const lnurl_1 = __importDefault(require("~/common/lib/lnurl"));
const typeHelpers_1 = require("~/common/utils/typeHelpers");
function Send() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "send" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const location = (0, react_router_dom_1.useLocation)();
    // location.state used to access the decoded QR coming from ScanQRCode screen
    const [invoice, setInvoice] = (0, react_2.useState)(((_a = location.state) === null || _a === void 0 ? void 0 : _a.decodedQR) || "");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [loading, setLoading] = (0, react_2.useState)(false);
    // Extract invoice from URL parameters (if available)
    // This is passed when a user selects "Pay with Alby" from the browser's context menu
    (0, react_2.useEffect)(() => {
        const url = new URL(window.location.href);
        const invoice = url.searchParams.get("invoice");
        if (invoice) {
            setInvoice(invoice);
            // Clean up URL without reloading
            url.searchParams.delete("invoice");
            window.history.replaceState(null, "", url.toString());
        }
    }, []);
    function isPubKey(str) {
        return str.length == 66 && (str.startsWith("02") || str.startsWith("03"));
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            try {
                setLoading(true);
                let lnurl = lnurl_1.default.findLnurl(invoice);
                if (lnurl_1.default.isLightningAddress(invoice)) {
                    lnurl = invoice;
                }
                if (lnurl === null || lnurl === void 0 ? void 0 : lnurl.endsWith("phoenixwallet.me")) {
                    throw new Error("Paying Phoenix addresses is not possible. Phoenix is not compatible with the current state of lightning addresses as they use a different protocol.");
                }
                if (lnurl) {
                    const lnurlDetails = yield lnurl_1.default.getDetails(lnurl);
                    if ((0, typeHelpers_1.isLNURLDetailsError)(lnurlDetails)) {
                        Toast_1.default.error(lnurlDetails.reason);
                        return;
                    }
                    if (lnurlDetails.tag === "channelRequest") {
                        navigate("/lnurlChannel", {
                            state: {
                                args: {
                                    lnurlDetails,
                                },
                            },
                        });
                    }
                    if (lnurlDetails.tag === "login") {
                        navigate("/lnurlAuth", {
                            state: {
                                args: {
                                    lnurlDetails,
                                },
                            },
                        });
                    }
                    if (lnurlDetails.tag === "payRequest") {
                        navigate("/lnurlPay", {
                            state: {
                                args: {
                                    lnurlDetails,
                                },
                            },
                        });
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
                }
                else if (isPubKey(invoice)) {
                    navigate("/keysend", {
                        state: {
                            args: {
                                destination: invoice,
                            },
                        },
                    });
                }
                else if ((0, utils_1.isBitcoinAddress)(invoice)) {
                    navigate("/sendToBitcoinAddress", {
                        state: { args: { bitcoinAddress: invoice } },
                    });
                }
                else {
                    bolt11_signet_1.default.decode(invoice); // throws if invalid.
                    navigate("/confirmPayment", {
                        state: {
                            args: {
                                paymentRequest: invoice,
                            },
                        },
                    });
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => navigate(-1), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "pt-4", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "invoice", label: t("input.label"), hint: t("input.hint_with_bitcoin_address"), value: invoice, disabled: loading, autoFocus: true, onChange: (event) => setInvoice((0, utils_1.extractLightningTagData)(event.target.value.trim())), endAdornment: (0, jsx_runtime_1.jsx)(QrcodeAdornment_1.default, { route: "send" }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: tCommon("actions.continue"), primary: true, fullWidth: true, loading: loading, disabled: invoice === "" || loading }) })] }) })] }));
}
exports.default = Send;
