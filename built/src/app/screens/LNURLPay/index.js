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
const Container_1 = __importDefault(require("@components/Container"));
const Hyperlink_1 = __importDefault(require("@components/Hyperlink"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const ResultCard_1 = __importDefault(require("@components/ResultCard"));
const SatButtons_1 = __importDefault(require("@components/SatButtons"));
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const react_1 = require("@popicons/react");
const axios_1 = __importDefault(require("axios"));
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Header_1 = __importDefault(require("~/app/components/Header"));
const IconButton_1 = __importDefault(require("~/app/components/IconButton"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const lnurl_1 = __importDefault(require("~/common/lib/lnurl"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const Dt = ({ children }) => ((0, jsx_runtime_1.jsx)("dt", { className: "font-medium text-gray-800 dark:text-white", children: children }));
const Dd = ({ children }) => ((0, jsx_runtime_1.jsx)("dd", { className: "mb-4 text-gray-600 dark:text-neutral-500 break-all", children: children }));
function LNURLPay() {
    var _a, _b, _c, _d, _e, _f;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const details = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.lnurlDetails;
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedSats, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const auth = (0, AccountContext_1.useAccount)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "lnurlpay" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const [valueSat, setValueSat] = (0, react_2.useState)(((details === null || details === void 0 ? void 0 : details.minSendable) &&
        Math.floor(+(details === null || details === void 0 ? void 0 : details.minSendable) / 1000).toString()) ||
        "");
    const amountMin = Math.floor(+details.minSendable / 1000);
    const amountMax = Math.floor(+details.maxSendable / 1000);
    const amountExceeded = (((_b = auth === null || auth === void 0 ? void 0 : auth.account) === null || _b === void 0 ? void 0 : _b.currency) || "BTC") !== "BTC"
        ? false
        : +valueSat > (((_c = auth === null || auth === void 0 ? void 0 : auth.account) === null || _c === void 0 ? void 0 : _c.balance) || 0);
    const rangeExceeded = +valueSat > amountMax || +valueSat < amountMin;
    const [showMoreFields, setShowMoreFields] = (0, react_2.useState)(false);
    const [fiatValue, setFiatValue] = (0, react_2.useState)("");
    const [comment, setComment] = (0, react_2.useState)("");
    const [userName, setUserName] = (0, react_2.useState)("");
    const [userEmail, setUserEmail] = (0, react_2.useState)("");
    const [loadingConfirm, setLoadingConfirm] = (0, react_2.useState)(false);
    const [successAction, setSuccessAction] = (0, react_2.useState)();
    (0, react_2.useEffect)(() => {
        const getFiat = () => __awaiter(this, void 0, void 0, function* () {
            const res = yield getFormattedFiat(valueSat);
            setFiatValue(res);
        });
        getFiat();
    }, [valueSat, showFiat, getFormattedFiat]);
    (0, react_2.useEffect)(() => {
        !!settings.userName && setUserName(settings.userName);
        !!settings.userEmail && setUserEmail(settings.userEmail);
    }, [settings.userName, settings.userEmail]);
    const getPayerData = (details) => {
        var _a, _b, _c, _d;
        if ((userName === null || userName === void 0 ? void 0 : userName.length) &&
            (userEmail === null || userEmail === void 0 ? void 0 : userEmail.length) &&
            ((_a = details.payerData) === null || _a === void 0 ? void 0 : _a.email) &&
            ((_b = details.payerData) === null || _b === void 0 ? void 0 : _b.name)) {
            return { name: userName, email: userEmail };
        }
        else if ((userName === null || userName === void 0 ? void 0 : userName.length) && ((_c = details.payerData) === null || _c === void 0 ? void 0 : _c.name)) {
            return { name: userName };
        }
        else if ((userEmail === null || userEmail === void 0 ? void 0 : userEmail.length) && ((_d = details.payerData) === null || _d === void 0 ? void 0 : _d.email)) {
            return { email: userEmail };
        }
        else {
            return undefined;
        }
    };
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!details)
                return;
            const payerdata = getPayerData(details);
            try {
                setLoadingConfirm(true);
                // Get the invoice
                const params = {
                    amount: parseInt(valueSat) * 1000,
                    comment: comment && comment,
                    payerdata: payerdata && JSON.stringify(payerdata), // https://github.com/fiatjaf/lnurl-rfc/blob/luds/18.md
                };
                let response;
                try {
                    response = yield axios_1.default.get(details.callback, {
                        params,
                        // https://github.com/fiatjaf/lnurl-rfc/blob/luds/01.md#http-status-codes-and-content-type
                        validateStatus: () => true,
                        adapter: "fetch",
                    });
                    if (response.status >= 500) {
                        Toast_1.default.error("Payment aborted: Recipient server error");
                        return;
                    }
                    const isSuccessResponse = function (obj) {
                        return Object.prototype.hasOwnProperty.call(obj, "pr");
                    };
                    if (!isSuccessResponse(response.data)) {
                        Toast_1.default.error(response.data.reason);
                        return;
                    }
                }
                catch (e) {
                    const message = e instanceof Error ? `(${e.message})` : "";
                    Toast_1.default.error(`Payment aborted: Could not fetch invoice. \n${message}`);
                    return;
                }
                const paymentInfo = response.data;
                const paymentRequest = paymentInfo.pr;
                const isValidInvoice = lnurl_1.default.verifyInvoice({
                    paymentInfo,
                    amount: parseInt(valueSat) * 1000,
                });
                if (!isValidInvoice) {
                    Toast_1.default.error("Payment aborted: Invalid invoice.");
                    return;
                }
                // LN WALLET pays the invoice, no additional user confirmation is required at this point
                const paymentResponse = yield msg_1.default.request("sendPayment", { paymentRequest }, {
                    origin: Object.assign(Object.assign({}, navState.origin), { name: getRecipient() }),
                });
                // Once payment is fulfilled LN WALLET executes a non-null successAction
                // LN WALLET should also store successAction data on the transaction record
                if (paymentInfo.successAction) {
                    switch (paymentInfo.successAction.tag) {
                        case "url":
                        case "message":
                            setSuccessAction(paymentInfo.successAction);
                            break;
                        case "aes": // TODO: For aes, LN WALLET must attempt to decrypt a ciphertext with payment preimage
                        default:
                            Toast_1.default.error(`Not implemented yet. Please submit an issue to support success action: ${paymentInfo.successAction.tag}`);
                            break;
                    }
                }
                else {
                    setSuccessAction({ tag: "message", message: t("success") });
                }
                auth.fetchAccountInfo(); // Update balance.
                // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the payment response. This closes the window which means the user will NOT see the above successAction.
                // We assume this is OK when it is called through webln.
                if (navState.isPrompt) {
                    msg_1.default.reply(paymentResponse);
                }
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error(`Error: ${e.message}`);
                }
            }
            finally {
                setLoadingConfirm(false);
            }
        });
    }
    function reject(e) {
        e.preventDefault();
        if (navState.isPrompt) {
            msg_1.default.error(constants_1.USER_REJECTED_ERROR);
        }
        else {
            navigate(-1);
        }
    }
    function close(e) {
        // will never be reached via prompt
        e.preventDefault();
        navigate(-1);
    }
    function getRecipient() {
        if (!(details === null || details === void 0 ? void 0 : details.metadata))
            return;
        try {
            const metadata = JSON.parse(details.metadata);
            const identifier = metadata.find(([type]) => type === "text/identifier");
            if (identifier)
                return identifier[1];
        }
        catch (e) {
            console.error(e);
        }
        return details.domain;
    }
    function getImage() {
        if (!(details === null || details === void 0 ? void 0 : details.metadata))
            return;
        try {
            const metadata = JSON.parse(details.metadata);
            const image = metadata.find(([type]) => type === "image/png;base64" || type === "image/jpeg;base64");
            if (image)
                return `data:${image[0]},${image[1]}`;
        }
        catch (e) {
            console.error(e);
        }
    }
    function formattedMetadata(metadataJSON) {
        try {
            const metadata = JSON.parse(metadataJSON);
            return metadata
                .map(([type, content]) => {
                if (type === "text/plain") {
                    return [`${tCommon("description")}`, content];
                }
                else if (type === "text/long-desc") {
                    return [
                        `${tCommon("description_full")}`,
                        (0, jsx_runtime_1.jsx)("p", { children: content }, type),
                    ];
                }
                return undefined;
            })
                .filter(Boolean);
        }
        catch (e) {
            console.error(e);
        }
        return [];
    }
    function renderSuccessAction() {
        var _a;
        if (!successAction)
            return;
        const isMessage = (successAction === null || successAction === void 0 ? void 0 : successAction.tag) === "url" || (successAction === null || successAction === void 0 ? void 0 : successAction.tag) === "message";
        let descriptionList = [];
        if (successAction.tag === "url") {
            descriptionList = [
                [`${tCommon("description")}`, successAction.description],
                [
                    "URL",
                    (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [successAction.url, (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => {
                                        if (successAction.url)
                                            utils_1.default.openUrl(successAction.url);
                                    }, label: tCommon("actions.open"), primary: true }) })] }),
                ],
            ];
        }
        else if (successAction.tag === "message") {
            descriptionList = [[`${tCommon("message")}`, successAction.message]];
        }
        return ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: tCommon("success_message", {
                                amount: getFormattedSats(valueSat),
                                fiatAmount: showFiat ? ` (${fiatValue})` : ``,
                                destination: ((_a = navState.origin) === null || _a === void 0 ? void 0 : _a.name) || getRecipient(),
                            }) }), isMessage && ((0, jsx_runtime_1.jsx)("dl", { className: "shadow bg-white dark:bg-surface-02dp mt-4 pt-4 px-4 rounded-lg mb-6 overflow-hidden", children: descriptionList.map(([dt, dd]) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dt, { children: dt }), (0, jsx_runtime_1.jsx)(Dd, { children: dd })] }))) }))] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] }));
    }
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    function toggleShowMoreFields() {
        setShowMoreFields(!showMoreFields);
    }
    function showCommentField() {
        return (details &&
            typeof details.commentAllowed === "number" &&
            details.commentAllowed > 0);
    }
    function showNameField() {
        var _a;
        return !!((_a = details === null || details === void 0 ? void 0 : details.payerData) === null || _a === void 0 ? void 0 : _a.name);
    }
    function showEmailField() {
        var _a;
        return !!((_a = details === null || details === void 0 ? void 0 : details.payerData) === null || _a === void 0 ? void 0 : _a.email);
    }
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col grow overflow-hidden", children: [!navState.isPrompt ? ((0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => navigate(-1), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: !successAction ? tCommon("actions.send") : tCommon("success") })) : ((0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: !successAction ? tCommon("actions.send") : tCommon("success") })), !successAction ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { className: "grow overflow-y-auto no-scrollbar", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: (_d = navState.origin) === null || _d === void 0 ? void 0 : _d.name, description: getRecipient(), image: ((_e = navState.origin) === null || _e === void 0 ? void 0 : _e.icon) || getImage() }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "flex grow", children: (0, jsx_runtime_1.jsxs)("div", { className: "grow flex flex-col justify-between", children: [(0, jsx_runtime_1.jsxs)("fieldset", { disabled: loadingConfirm, children: [(0, jsx_runtime_1.jsx)("dl", { className: "mt-4 overflow-hidden", children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [formattedMetadata(details.metadata).map(([dt, dd], i) => ((0, jsx_runtime_1.jsxs)(react_2.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dt, { children: dt }), (0, jsx_runtime_1.jsx)(Dd, { children: dd })] }, `element-${i}`))), details.minSendable === details.maxSendable && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("amount.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: getFormattedSats(Math.floor(+details.minSendable / 1000)) })] }))] }) }), details &&
                                                        details.minSendable !== details.maxSendable && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { autoFocus: true, id: "amount", label: t("amount.label"), min: amountMin, max: amountMax, rangeExceeded: rangeExceeded, value: valueSat, onChange: (e) => setValueSat(e.target.value), fiatValue: fiatValue, hint: `${tCommon("balance")}: ${(_f = auth === null || auth === void 0 ? void 0 : auth.balancesDecorated) === null || _f === void 0 ? void 0 : _f.accountBalance}`, amountExceeded: amountExceeded }), (0, jsx_runtime_1.jsx)(SatButtons_1.default, { min: amountMin, max: amountMax, onClick: setValueSat, disabled: loadingConfirm })] })), showCommentField() && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "comment", label: t("comment.label"), placeholder: tCommon("optional"), onChange: (e) => {
                                                                setComment(e.target.value);
                                                            } }) })), (showNameField() || showEmailField()) && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-4 caret-transparent", children: (0, jsx_runtime_1.jsxs)(Hyperlink_1.default, { onClick: toggleShowMoreFields, children: [tCommon("actions.more"), " ", showMoreFields ? ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronTopLine, { className: "h-5 w-5 inline-flex" })) : ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronBottomLine, { className: "h-5 w-5 inline-flex" }))] }) })), showMoreFields && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [showNameField() && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "name", label: t("name.label"), placeholder: tCommon("optional"), value: userName, onChange: (e) => {
                                                                        setUserName(e.target.value);
                                                                    } }) })), showEmailField() && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "email", label: t("email.label"), placeholder: tCommon("optional"), value: userEmail, onChange: (e) => {
                                                                        setUserEmail(e.target.value);
                                                                    } }) }))] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 dark:border-white/10", children: (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { isFocused: false, label: tCommon("actions.confirm"), loading: loadingConfirm, disabled: loadingConfirm || amountExceeded || rangeExceeded, onCancel: reject }) })] }) })] }) }) })) : (renderSuccessAction())] }) }));
}
exports.default = LNURLPay;
