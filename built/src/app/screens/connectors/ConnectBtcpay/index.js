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
const CompanionDownloadInfo_1 = __importDefault(require("@components/CompanionDownloadInfo"));
const ConnectorForm_1 = __importDefault(require("@components/ConnectorForm"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const btcpay_svg_1 = __importDefault(require("/static/assets/icons/btcpay.svg"));
const initialFormData = {
    url: "",
    macaroon: "",
    name: "",
};
function ConnectBtcpay() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.btcpay",
    });
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasTorSupport, setHasTorSupport] = (0, react_1.useState)(false);
    function getConfigUrl(data) {
        const configUrl = data.trim().replace("config=", "");
        try {
            return new URL(configUrl);
        }
        catch (e) {
            return null;
        }
    }
    function handleChange(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const configUrl = getConfigUrl(event.target.value);
            if (!configUrl) {
                return;
            }
            const host = configUrl.host;
            try {
                const response = yield axios_1.default.get(configUrl.toString(), { adapter: "fetch" });
                if (response.data.configurations[0].uri) {
                    setFormData({
                        url: response.data.configurations[0].uri,
                        macaroon: response.data.configurations[0].adminMacaroon,
                        name: host,
                    });
                }
            }
            catch (e) {
                console.error(e);
                Toast_1.default.error(t("errors.connection_failed"));
            }
        });
    }
    function getConnectorType() {
        if (formData.url.match(/\.onion/i) && !hasTorSupport) {
            return "nativelnd";
        }
        // default to LND
        return "lnd";
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const { url, macaroon, name } = formData;
            const account = {
                name: name || "LND",
                config: {
                    macaroon,
                    url,
                },
                connector: getConnectorType(),
            };
            try {
                let validation;
                // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
                if (account.connector === "nativelnd") {
                    validation = { valid: true, error: "" };
                }
                else {
                    validation = yield msg_1.default.request("validateAccount", account);
                }
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
                let message = "";
                if (e instanceof Error) {
                    message += `${e.message}`;
                }
                Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: message }));
            }
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: t("page.title"), description: t("page.instructions"), logo: btcpay_svg_1.default, submitLoading: loading, submitDisabled: formData.url === "" || formData.macaroon === "", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)(TextField_1.default, { id: "btcpay-config", label: t("config.label"), placeholder: t("config.placeholder"), onChange: handleChange, required: true, autoFocus: true }), formData.url.match(/\.onion/i) && ((0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(CompanionDownloadInfo_1.default, { hasTorCallback: (hasTor) => {
                        setHasTorSupport(hasTor);
                    } }) }))] }));
}
exports.default = ConnectBtcpay;
