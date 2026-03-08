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
const ContentMessage_1 = __importDefault(require("@components/ContentMessage"));
const Header_1 = __importDefault(require("@components/Header"));
const IconButton_1 = __importDefault(require("@components/IconButton"));
const ResultCard_1 = __importDefault(require("@components/ResultCard"));
const SatButtons_1 = __importDefault(require("@components/SatButtons"));
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Container_1 = __importDefault(require("~/app/components/Container"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const msg_1 = __importDefault(require("~/common/lib/msg"));
function Keysend() {
    var _a, _b, _c, _d, _e, _f;
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedSats, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const auth = (0, AccountContext_1.useAccount)();
    const [amountSat, setAmountSat] = (0, react_2.useState)(((_a = navState === null || navState === void 0 ? void 0 : navState.args) === null || _a === void 0 ? void 0 : _a.amount) || "1");
    const customRecords = (_b = navState === null || navState === void 0 ? void 0 : navState.args) === null || _b === void 0 ? void 0 : _b.customRecords;
    const destination = (_c = navState === null || navState === void 0 ? void 0 : navState.args) === null || _c === void 0 ? void 0 : _c.destination;
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_2.useState)("");
    const [fiatAmount, setFiatAmount] = (0, react_2.useState)("");
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "keysend" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const amountMin = 1;
    const amountExceeded = (((_d = auth === null || auth === void 0 ? void 0 : auth.account) === null || _d === void 0 ? void 0 : _d.currency) || "BTC") !== "BTC"
        ? false
        : +amountSat > (((_e = auth === null || auth === void 0 ? void 0 : auth.account) === null || _e === void 0 ? void 0 : _e.balance) || 0);
    const rangeExceeded = +amountSat < amountMin;
    (0, react_2.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (amountSat !== "" && showFiat) {
                const res = yield getFormattedFiat(amountSat);
                setFiatAmount(res);
            }
        }))();
    }, [amountSat, showFiat, getFormattedFiat]);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const payment = yield msg_1.default.request("keysend", { destination, amount: amountSat, customRecords }, {
                    origin: {
                        name: destination,
                    },
                });
                setSuccessMessage(t("success", {
                    preimage: payment.preimage,
                }));
                auth.fetchAccountInfo(); // Update balance.
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
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => navigate("/send"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: t("receiver.label"), content: destination }), (0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { id: "amount", label: t("amount.label"), min: 1, onChange: (e) => setAmountSat(e.target.value), value: amountSat, fiatValue: fiatAmount, hint: `${tCommon("balance")}: ${(_f = auth === null || auth === void 0 ? void 0 : auth.balancesDecorated) === null || _f === void 0 ? void 0 : _f.accountBalance}`, amountExceeded: amountExceeded, rangeExceeded: rangeExceeded }), (0, jsx_runtime_1.jsx)(SatButtons_1.default, { onClick: setAmountSat })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-8", children: (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { label: tCommon("actions.confirm"), onCancel: reject, loading: loading, disabled: loading || rangeExceeded || amountExceeded }) })] }) }) })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: !destination
                            ? successMessage
                            : tCommon("success_message", {
                                amount: getFormattedSats(amountSat),
                                fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                                destination,
                            }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] }))] }));
}
exports.default = Keysend;
