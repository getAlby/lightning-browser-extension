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
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Header_1 = __importDefault(require("@components/Header"));
const IconButton_1 = __importDefault(require("@components/IconButton"));
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_loading_skeleton_1 = __importDefault(require("react-loading-skeleton"));
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Container_1 = __importDefault(require("~/app/components/Container"));
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const ResultCard_1 = __importDefault(require("~/app/components/ResultCard"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const Dt = ({ children }) => ((0, jsx_runtime_1.jsx)("dt", { className: "text-sm text-gray-500 dark:text-neutral-500", children: children }));
const Dd = ({ children }) => ((0, jsx_runtime_1.jsx)("dd", { className: "text-gray-700 dark:text-neutral-200", children: children }));
function SendToBitcoinAddress() {
    var _a, _b, _c, _d;
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedSats, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const auth = (0, AccountContext_1.useAccount)();
    const bitcoinAddress = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.bitcoinAddress;
    const [amountSat, setAmountSat] = (0, react_2.useState)("");
    // change to "amount" when built-in swaps will be available
    const [step, setStep] = (0, react_2.useState)("unavailable");
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [fiatAmount, setFiatAmount] = (0, react_2.useState)("");
    const [predictedTotalFee, setPredictedTotalFee] = (0, react_2.useState)("0");
    const [predictedTotalFeeFiat, setPredictedTotalFeeFiat] = (0, react_2.useState)("0");
    const [serviceFeePercentage, setServiceFeePercentage] = (0, react_2.useState)(0);
    const [feesLoading, setFeesLoading] = (0, react_2.useState)(false);
    const [networkFee, setNetworkFee] = (0, react_2.useState)(0);
    const [networkFeeFiat, setNetworkFeeFiat] = (0, react_2.useState)("");
    const [serviceFeeFiat, setServiceFeeFiat] = (0, react_2.useState)("");
    const [satsPerVbyte, setSatsPerVbyte] = (0, react_2.useState)(0);
    const [totalAmountFiat, setTotalAmountFiat] = (0, react_2.useState)("");
    const [amountFiat, setAmountFiat] = (0, react_2.useState)("");
    const [swapDataLoading, setSwapDataLoading] = (0, react_2.useState)(false);
    const [swapData, setSwapData] = (0, react_2.useState)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "send_to_bitcoin_address",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    (0, react_2.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (amountSat !== "" && showFiat) {
                const res = yield getFormattedFiat(amountSat);
                setFiatAmount(res);
            }
        }))();
    }, [amountSat, showFiat, getFormattedFiat]);
    (0, react_2.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                setFeesLoading(true);
                const result = yield api_1.default.getSwapInfo();
                if (!result.available) {
                    throw new Error("Swaps currently not available");
                }
                setServiceFeePercentage(result.service_fee_percentage);
                setSatsPerVbyte(result.sats_per_vbyte);
                setNetworkFee(result.network_fee);
                if (showFiat) {
                    setNetworkFeeFiat(yield getFormattedFiat(result.network_fee));
                }
            }
            catch (e) {
                console.error(e);
                setStep("unavailable");
            }
            finally {
                setFeesLoading(false);
            }
        }))();
    }, [getFormattedFiat, showFiat, t]);
    (0, react_2.useEffect)(() => {
        if (!feesLoading) {
            try {
                const predictedTotalFee = Math.floor(parseInt(amountSat || "0") * (serviceFeePercentage / 100) + networkFee);
                setPredictedTotalFee(getFormattedSats(predictedTotalFee));
                (() => __awaiter(this, void 0, void 0, function* () {
                    setPredictedTotalFeeFiat(yield getFormattedFiat(predictedTotalFee));
                }))();
            }
            catch (error) {
                setPredictedTotalFee("0");
                setPredictedTotalFeeFiat("0");
            }
        }
    }, [
        getFormattedFiat,
        amountSat,
        feesLoading,
        getFormattedSats,
        serviceFeePercentage,
        networkFee,
    ]);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!swapData)
                return;
            try {
                setLoading(true);
                const response = yield msg_1.default.request("sendPayment", {
                    paymentRequest: swapData.payment_request,
                }, {
                    origin: navState.origin,
                });
                if (response.error) {
                    throw new Error(response.error);
                }
                // Update balance
                auth.fetchAccountInfo();
                setStep("success");
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error(`Error: ${e.message}`);
                }
            }
            finally {
                setLoading(false);
            }
        });
    }
    function reject(e) {
        e.preventDefault();
        navigate(-1);
    }
    function close(e) {
        // will never be reached via prompt
        e.preventDefault();
        navigate(-1);
    }
    function handleReview(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            try {
                setSwapDataLoading(true);
                const result = yield api_1.default.createSwap({
                    amount: +amountSat,
                    address: bitcoinAddress,
                    sats_per_vbyte: satsPerVbyte,
                });
                setSwapData(result);
                if (showFiat) {
                    setAmountFiat(yield getFormattedFiat(result.amount));
                    setNetworkFeeFiat(yield getFormattedFiat(result.network_fee));
                    setServiceFeeFiat(yield getFormattedFiat(result.service_fee));
                    setTotalAmountFiat(yield getFormattedFiat(result.total));
                }
                setStep("review");
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error(`Error: ${e.message}`);
                }
            }
            finally {
                setSwapDataLoading(false);
            }
        });
    }
    function handleConfirm(event) {
        event.preventDefault();
        confirm();
    }
    const amountMin = 100000;
    const amountMax = 10000000;
    const amountExceeded = (((_b = auth === null || auth === void 0 ? void 0 : auth.account) === null || _b === void 0 ? void 0 : _b.currency) || "BTC") !== "BTC"
        ? false
        : +amountSat > (((_c = auth === null || auth === void 0 ? void 0 : auth.account) === null || _c === void 0 ? void 0 : _c.balance) || 0);
    const rangeExceeded = +amountSat > amountMax || +amountSat < amountMin;
    const timeEstimateAlert = (0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: t("time_estimate") });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => navigate("/send"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), (0, jsx_runtime_1.jsxs)("div", { className: "h-full pt-5", children: [step == "amount" && ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleReview, className: "h-full flex space-between", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-3 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("recipient.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsx)(BitcoinAddress, { address: bitcoinAddress }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("provider.label") }), (0, jsx_runtime_1.jsxs)(Dd, { children: [(0, jsx_runtime_1.jsx)(Hyperlink_1.default, { href: "https://deezy.io", target: "_blank", rel: "noopener nofollow", children: "deezy.io" }), "\u00A0 (support@deezy.io)"] })] }), (0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { id: "amount", label: tCommon("amount"), min: amountMin, max: amountMax, onChange: (e) => setAmountSat(e.target.value), value: amountSat, fiatValue: fiatAmount, rangeExceeded: rangeExceeded, amountExceeded: amountExceeded, hint: `${tCommon("balance")}: ${(_d = auth === null || auth === void 0 ? void 0 : auth.balancesDecorated) === null || _d === void 0 ? void 0 : _d.accountBalance}` }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("total_fee.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: feesLoading ? ((0, jsx_runtime_1.jsx)(react_loading_skeleton_1.default, { className: "w-8" })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["~", predictedTotalFee] }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 dark:text-neutral-500", children: predictedTotalFeeFiat })] })) })] })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { label: tCommon("actions.review"), onCancel: reject, loading: loading || swapDataLoading, disabled: loading ||
                                        feesLoading ||
                                        swapDataLoading ||
                                        !networkFee || // Loading swap info failed
                                        !amountSat ||
                                        rangeExceeded ||
                                        amountExceeded })] }) })), step == "review" && swapData && ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleConfirm, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-3 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("recipient.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsx)(BitcoinAddress, { address: swapData.address }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: tCommon("amount") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: getFormattedSats(swapData.amount) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 dark:text-neutral-500", children: amountFiat })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("network_fee.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: getFormattedSats(swapData.network_fee) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 dark:text-neutral-500", children: networkFeeFiat })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("service_fee.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: getFormattedSats(swapData.service_fee) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 dark:text-neutral-500", children: serviceFeeFiat })] }) })] }), (0, jsx_runtime_1.jsx)("hr", { className: "dark:border-white/10" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-lg", children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("total.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: getFormattedSats(swapData.total) }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-500 dark:text-neutral-500", children: totalAmountFiat })] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "", children: timeEstimateAlert })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { label: tCommon("actions.confirm"), onCancel: reject, loading: loading, disabled: loading || !amountSat })] }) })), step == "success" && ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: tCommon("success_message", {
                                    amount: getFormattedSats(amountSat),
                                    fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                                    destination: bitcoinAddress.substring(0, 7) +
                                        "..." +
                                        bitcoinAddress.substring(bitcoinAddress.length - 7),
                                }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-center my-4", children: (0, jsx_runtime_1.jsxs)(Hyperlink_1.default, { href: `https://mempool.space/address/${bitcoinAddress}`, rel: "noopener nofollow", target: "_blank", children: [t("view_on_explorer"), (0, jsx_runtime_1.jsx)(react_1.PopiconsLinkExternalSolid, { className: "w-6 h-6 inline" })] }) }), timeEstimateAlert, (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] })), step == "unavailable" && ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ExchangeLink, { href: "https://boltz.exchange/", imageSrc: "/assets/icons/swap/boltz.png", title: "Boltz Exchange", description: "Privacy first, non-Custodial bitcoin exchange" }), (0, jsx_runtime_1.jsx)(ExchangeLink, { href: "https://sideshift.ai/ln/btc", imageSrc: "/assets/icons/swap/sideshift.svg", title: "sideshift.ai", description: "No sign-up crypto exchange" })] }))] })] }));
}
exports.default = SendToBitcoinAddress;
const ExchangeLink = ({ href, imageSrc, title, description, }) => {
    return ((0, jsx_runtime_1.jsx)("a", { href: href, target: "_blank", rel: "noreferrer", className: "mt-4", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-surface-01dp shadow flex p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer w-full", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3 items-center ", children: [(0, jsx_runtime_1.jsx)("img", { src: imageSrc, alt: "image", className: "h-14 w-14 rounded-lg object-cover" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-medium font-serif text-base dark:text-white", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "font-serif text-sm font-normal text-gray-500 dark:text-neutral-400 line-clamp-3", children: description })] })] }) }) }, href));
};
function BitcoinAddress({ address }) {
    return ((0, jsx_runtime_1.jsx)("span", { title: address, children: address.substring(0, 18) +
            "..." +
            address.substring(address.length - 18) }));
}
