"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const ConnectorForm_1 = __importDefault(require("@components/ConnectorForm"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const Button_1 = __importDefault(require("~/app/components/Button"));
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const LaWalletToast_1 = __importDefault(require("~/app/screens/connectors/ConnectLaWallet/LaWalletToast"));
const lawallet_1 = __importStar(require("~/extension/background-script/connectors/lawallet"));
const nostr_1 = __importDefault(require("~/extension/background-script/nostr"));
const lawallet_png_1 = __importDefault(require("/static/assets/icons/lawallet.png"));
const initialFormData = {
    private_key: "",
    api_endpoint: "https://api.lawallet.ar",
    identity_endpoint: "https://lawallet.ar",
    ledger_public_key: "bd9b0b60d5cd2a9df282fc504e88334995e6fac8b148fa89e0f8c09e2a570a84",
    urlx_public_key: "e17feb5f2cf83546bcf7fd9c8237b05275be958bd521543c2285ffc6c2d654b3",
    relay_url: "wss://relay.lawallet.ar",
};
function ConnectLaWallet() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.lawallet",
    });
    const [passwordViewVisible, setPasswordViewVisible] = (0, react_1.useState)(false);
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showAdvanced, setShowAdvanced] = (0, react_1.useState)(false);
    function getConnectorType() {
        return "lawallet";
    }
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const { private_key, api_endpoint, identity_endpoint, ledger_public_key, urlx_public_key, relay_url, } = formData;
            const domain = identity_endpoint.replace(/https?:\/\//, "");
            let username;
            try {
                const publicKey = new nostr_1.default(private_key).getPublicKey();
                const response = yield lawallet_1.default.request(identity_endpoint, "GET", `/api/pubkey/${publicKey}`, undefined);
                username = response.username;
            }
            catch (e) {
                if (e instanceof lawallet_1.HttpError && e.status === 404) {
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(LaWalletToast_1.default, { domain: domain }), {
                        position: "top-center",
                    });
                }
                else {
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: e.message }));
                }
                setLoading(false);
                return;
            }
            const account = {
                name: `${username}@${domain}`,
                config: {
                    privateKey: private_key,
                    apiEndpoint: api_endpoint,
                    identityEndpoint: identity_endpoint,
                    ledgerPublicKey: ledger_public_key,
                    urlxPublicKey: urlx_public_key,
                    relayUrl: relay_url,
                },
                connector: getConnectorType(),
            };
            yield msg_1.default.request("validateAccount", account);
            try {
                const addResult = yield msg_1.default.request("addAccount", account);
                if (addResult.accountId) {
                    yield msg_1.default.request("selectAccount", {
                        id: addResult.accountId,
                    });
                    navigate("/test-connection");
                }
            }
            catch (e) {
                console.error(e);
                let message = "";
                if (e instanceof Error) {
                    message += `${e.message}`;
                }
                Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: message }));
            }
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: t("page.title"), description: t("page.instructions"), logo: lawallet_png_1.default, submitLoading: loading, submitDisabled: formData.private_key === "", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col space-y-6", children: [(0, jsx_runtime_1.jsx)(TextField_1.default, { id: "private_key", label: t("private_key"), placeholder: t("private_key"), onChange: handleChange, type: passwordViewVisible ? "text" : "password", required: true, autoFocus: true, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                setPasswordViewVisible(passwordView);
                            } }) }), (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "identity_endpoint", label: t("identity_endpoint"), value: formData.identity_endpoint, required: true, title: t("identity_endpoint"), onChange: handleChange }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => {
                            setShowAdvanced(!showAdvanced);
                        }, label: tCommon("advanced") })] }), showAdvanced && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-6 flex flex-col space-y-6", children: [(0, jsx_runtime_1.jsx)(TextField_1.default, { id: "api_endpoint", label: t("api_endpoint"), value: formData.api_endpoint, required: true, title: t("api_endpoint"), onChange: handleChange }), (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "ledger_public_key", label: t("ledger_public_key"), value: formData.ledger_public_key, required: true, title: t("ledger_public_key"), onChange: handleChange }), (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "urlx_public_key", label: t("urlx_public_key"), value: formData.urlx_public_key, required: true, title: t("urlx_public_key"), onChange: handleChange }), (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "relay_url", label: t("relay_url"), value: formData.relay_url, required: true, title: t("relay_url"), onChange: handleChange })] }))] }));
}
exports.default = ConnectLaWallet;
