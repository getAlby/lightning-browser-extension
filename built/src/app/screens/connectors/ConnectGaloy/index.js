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
exports.galoyUrls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ConnectorForm_1 = __importDefault(require("@components/ConnectorForm"));
const Input_1 = __importDefault(require("@components/form/Input"));
const Select_1 = __importDefault(require("@components/form/Select"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const galoy_bitcoin_jungle_png_1 = __importDefault(require("/static/assets/icons/galoy_bitcoin_jungle.png"));
const galoy_blink_png_1 = __importDefault(require("/static/assets/icons/galoy_blink.png"));
exports.galoyUrls = {
    "galoy-blink": {
        i18nPrefix: "blink",
        label: "Blink Wallet",
        website: "https://www.blink.sv/",
        logo: galoy_blink_png_1.default,
        url: process.env.BLINK_GALOY_URL || "https://api.blink.sv/graphql",
        getHeaders: (authToken) => ({
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-API-KEY": authToken,
        }),
        apiCompatibilityMode: false,
    },
    "galoy-bitcoin-jungle": {
        i18nPrefix: "bitcoin_jungle",
        label: "Bitcoin Jungle Wallet",
        website: "https://bitcoinjungle.app/",
        logo: galoy_bitcoin_jungle_png_1.default,
        url: process.env.BITCOIN_JUNGLE_GALOY_URL ||
            "https://api.mainnet.bitcoinjungle.app/graphql",
        getHeaders: (authToken) => ({
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        }),
        apiCompatibilityMode: true,
    },
};
function ConnectGaloy(props) {
    const { instance } = props;
    const { url, label, website, i18nPrefix, logo, apiCompatibilityMode } = exports.galoyUrls[instance];
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector",
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [authToken, setAuthToken] = (0, react_1.useState)();
    const [currency, setCurrency] = (0, react_1.useState)("BTC");
    function handleAuthTokenChange(event) {
        setAuthToken(event.target.value.trim());
    }
    function handleCurrencyChange(event) {
        setCurrency(event.target.value);
    }
    function loginWithAuthToken(event) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const meQuery = {
                query: `
          query getinfo {
            me {
              defaultAccount {
                wallets {
                  walletCurrency
                  id
                }
              }
            }
          }
        `,
            };
            try {
                if (!authToken) {
                    const errorMsg = `${t("galoy.errors.missing_token")}`;
                    throw new Error(errorMsg);
                }
                const headers = exports.galoyUrls[instance].getHeaders(authToken);
                const { data: meData } = yield axios_1.default.post(url, meQuery, {
                    headers: headers,
                    adapter: "fetch",
                });
                if (meData.error || meData.errors) {
                    const error = meData.error || meData.errors;
                    console.error(error);
                    const errMessage = ((_b = (_a = error === null || error === void 0 ? void 0 : error.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || ((_c = error === null || error === void 0 ? void 0 : error[0]) === null || _c === void 0 ? void 0 : _c.message);
                    const alertMsg = `${t("galoy.errors.setup_failed")}${errMessage ? `: ${errMessage}` : ""}`;
                    Toast_1.default.error(alertMsg);
                }
                else {
                    // Find the BTC wallet and get its ID
                    const btcWallet = meData.data.me.defaultAccount.wallets.find((w) => w.walletCurrency === currency);
                    const walletId = btcWallet.id;
                    saveAccount({ headers, walletId, currency });
                }
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    const unauthedRegex = /status code 401/;
                    Toast_1.default.error(`${t("galoy.errors.setup_failed")}: ${e.message.match(unauthedRegex)
                        ? `${t("galoy.errors.invalid_token")}`
                        : e.message}`);
                }
            }
            finally {
                setLoading(false);
            }
        });
    }
    function saveAccount(config) {
        return __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            const account = {
                name: label,
                config: {
                    url,
                    headers: config.headers,
                    walletId: config.walletId,
                    apiCompatibilityMode,
                    currency: config.currency,
                },
                connector: "galoy",
            };
            try {
                const validation = yield msg_1.default.request("validateAccount", account);
                if (validation.valid) {
                    const addResult = yield msg_1.default.request("addAccount", account);
                    if (addResult.accountId) {
                        yield msg_1.default.request("selectAccount", {
                            id: addResult.accountId,
                        });
                        navigate("/test-connection");
                    }
                }
                else {
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error }));
                }
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: e.message }));
                }
            }
            finally {
                setLoading(false);
            }
        });
    }
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold dark:text-white", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: `${i18nPrefix}.page.title`, t: t, components: [
                    // eslint-disable-next-line react/jsx-key
                    (0, jsx_runtime_1.jsx)("a", { className: "underline", href: website }),
                ] }) }), logo: logo, submitLabel: t("galoy.actions.login"), submitLoading: loading, onSubmit: loginWithAuthToken, description: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: `${i18nPrefix}.token.info`, t: t, values: { label }, components: [
                (0, jsx_runtime_1.jsx)("a", { href: "https://dashboard.blink.sv", className: "underline", target: "_blank", rel: "noopener noreferrer" }, "Blink Dashboard"),
            ] }), children: [(0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "authToken", className: "block font-medium text-gray-800 dark:text-white", children: t(`${i18nPrefix}.token.label`) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1", children: (0, jsx_runtime_1.jsx)(Input_1.default, { id: "authToken", name: "authToken", required: true, onChange: handleAuthTokenChange, autoFocus: true }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "currency", className: "block font-medium text-gray-800 dark:text-white", children: t(`${i18nPrefix}.currency.label`) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1", children: (0, jsx_runtime_1.jsxs)(Select_1.default, { id: "currency", name: "currency", required: true, onChange: handleCurrencyChange, children: [(0, jsx_runtime_1.jsx)("option", { value: "BTC", children: "BTC" }), (0, jsx_runtime_1.jsx)("option", { value: "USD", children: "USD (Stablesats)" })] }) })] })] }));
}
exports.default = ConnectGaloy;
