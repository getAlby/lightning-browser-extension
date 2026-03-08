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
const Loading_1 = __importDefault(require("@components/Loading"));
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_confetti_1 = __importDefault(require("react-confetti"));
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Avatar_1 = __importDefault(require("~/app/components/Avatar"));
const QRCode_1 = __importDefault(require("~/app/components/QRCode"));
const ResultCard_1 = __importDefault(require("~/app/components/ResultCard"));
const SkeletonLoader_1 = __importDefault(require("~/app/components/SkeletonLoader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const helpers_1 = require("~/common/utils/helpers");
function ReceiveInvoice() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "receive" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const auth = (0, AccountContext_1.useAccount)();
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [formData, setFormData] = (0, react_2.useState)({
        amount: "0",
        description: "",
        expiration: "",
    });
    const [loadingInvoice, setLoadingInvoice] = (0, react_2.useState)(false);
    const [invoice, setInvoice] = (0, react_2.useState)();
    const [paid, setPaid] = (0, react_2.useState)(false);
    const [pollingForPayment, setPollingForPayment] = (0, react_2.useState)(false);
    const mounted = (0, react_2.useRef)(false);
    const isAlbyOAuthUser = (0, utils_1.isAlbyOAuthAccount)((_a = auth.account) === null || _a === void 0 ? void 0 : _a.connectorType);
    (0, react_2.useEffect)(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const theme = (0, utils_1.useTheme)();
    const [fiatAmount, setFiatAmount] = (0, react_2.useState)("");
    (0, react_2.useEffect)(() => {
        if (formData.amount !== "" && showFiat) {
            (() => __awaiter(this, void 0, void 0, function* () {
                const res = yield getFormattedFiat(formData.amount);
                setFiatAmount(res);
            }))();
        }
    }, [formData, showFiat, getFormattedFiat]);
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function checkPayment(paymentHash) {
        setPollingForPayment(true);
        (0, helpers_1.poll)({
            fn: () => msg_1.default.request("checkPayment", { paymentHash }),
            validate: (payment) => payment.paid,
            interval: 3000,
            maxAttempts: 20,
            shouldStopPolling: () => !mounted.current,
        })
            .then(() => {
            setPaid(true);
            auth.fetchAccountInfo(); // Update balance.
        })
            .catch((err) => console.error(err))
            .finally(() => {
            setPollingForPayment(false);
        });
    }
    function setDefaults() {
        setFormData({
            amount: "0",
            description: "",
            expiration: "",
        });
        setPaid(false);
        setPollingForPayment(false);
        setInvoice(null);
    }
    function createInvoice() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoadingInvoice(true);
                const response = yield api_1.default.makeInvoice({
                    amount: formData.amount,
                    memo: formData.description,
                });
                setInvoice(response);
                checkPayment(response.rHash);
            }
            catch (e) {
                if (e instanceof Error) {
                    Toast_1.default.error(e.message);
                }
            }
            finally {
                setLoadingInvoice(false);
            }
        });
    }
    function handleSubmit(event) {
        event.preventDefault();
        createInvoice();
    }
    function renderInvoice() {
        if (!invoice)
            return null;
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!paid && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "mt-4 flex justify-center items-center", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-surface-01dp border-gray-200 dark:border-neutral-700  p-4 rounded-md border max-w-md", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)(QRCode_1.default, { value: invoice.paymentRequest.toUpperCase(), size: 512 }), isAlbyOAuthUser ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: !auth.accountLoading && auth.account ? ((0, jsx_runtime_1.jsx)(Avatar_1.default, { size: 64, className: "border-[6px] border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1 bg-white", url: auth.account.avatarUrl, name: auth.account.id })) : (auth.accountLoading && ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { circle: true, opaque: false, className: "w-[64px] h-[64px] border-[6px] border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1 opacity-100" }))) })) : ((0, jsx_runtime_1.jsx)("img", { className: "w-[64px] h-[64px] absolute z-1", src: theme === "dark"
                                                ? "assets/icons/alby_logo_qr_dark.svg"
                                                : "assets/icons/alby_logo_qr_light.svg", alt: "Alby logo" }))] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 mb-4 flex justify-center", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        navigator.clipboard.writeText(invoice.paymentRequest);
                                        Toast_1.default.success(tCommon("copied"));
                                    }
                                    catch (e) {
                                        if (e instanceof Error) {
                                            Toast_1.default.error(e.message);
                                        }
                                    }
                                }), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsCopyLine, { className: "w-6 h-6 mr-2" }), label: tCommon("actions.copy_invoice"), primary: true }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center", children: [pollingForPayment && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 dark:text-white", children: [(0, jsx_runtime_1.jsx)(Loading_1.default, {}), (0, jsx_runtime_1.jsx)("span", { children: t("payment.waiting") })] })), !pollingForPayment && ((0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => checkPayment(invoice.rHash), label: t("payment.status") }))] })] })), paid && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: t("success") }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: tCommon("actions.receive_again"), primary: true, fullWidth: true, onClick: () => {
                                    setDefaults();
                                    navigate("/receive/invoice");
                                } }) }), (0, jsx_runtime_1.jsx)(react_confetti_1.default, { width: window.innerWidth, height: window.innerHeight, recycle: false, onConfettiComplete: (confetti) => {
                                confetti && confetti.reset();
                            }, style: { pointerEvents: "none" } })] }))] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => {
                        invoice ? setDefaults() : navigate(-1);
                    }, icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), invoice ? ((0, jsx_runtime_1.jsx)("div", { className: "h-full", children: (0, jsx_runtime_1.jsx)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: renderInvoice() }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "pt-4 h-full", children: (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsx)("fieldset", { disabled: loadingInvoice, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: (0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { id: "amount", min: 0, label: t("amount.label"), placeholder: t("amount.placeholder"), fiatValue: fiatAmount, onChange: handleChange, autoFocus: true }) }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "description", label: t("description.label"), placeholder: t("description.placeholder"), onChange: handleChange }) })] }), (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: t("actions.create_invoice"), fullWidth: true, primary: true, loading: loadingInvoice, disabled: loadingInvoice })] }) }) }) }))] }));
}
exports.default = ReceiveInvoice;
