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
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const startos_png_1 = __importDefault(require("/static/assets/icons/startos.png"));
const initialFormData = {
    url: "",
    macaroon: "",
};
function ConnectStartOS() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.startos",
    });
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasTorSupport, setHasTorSupport] = (0, react_1.useState)(false);
    const [lndconnectUrlVisible, setLndconnectUrlVisible] = (0, react_1.useState)(false);
    function handleLndconnectUrl(event) {
        try {
            const lndconnectUrl = event.target.value.trim();
            let lndconnect = new URL(lndconnectUrl);
            lndconnect.protocol = "http:";
            lndconnect = new URL(lndconnect.toString());
            const url = `https://${lndconnect.host}${lndconnect.pathname}`;
            let macaroon = lndconnect.searchParams.get("macaroon") || "";
            macaroon = utils_1.default.urlSafeBase64ToHex(macaroon);
            // const cert = lndconnect.searchParams.get("cert"); // TODO: handle LND certs with the native connector
            setFormData(Object.assign(Object.assign({}, formData), { url,
                macaroon }));
        }
        catch (e) {
            console.error("invalid lndconnect string", e);
        }
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
            const { url, macaroon } = formData;
            const account = {
                name: "StartOS",
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
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error, link: `${formData.url}/v1/getinfo` }));
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
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold dark:text-white", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.title", t: t, components: [
                    // eslint-disable-next-line react/jsx-key
                    (0, jsx_runtime_1.jsx)("a", { className: "underline", href: "https://start9.com/" }),
                ] }) }), description: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.instructions", t: t, components: [
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("strong", {}),
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("br", {}),
            ] }), logo: startos_png_1.default, submitLoading: loading, submitDisabled: formData.url === "" || formData.macaroon === "", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "lndconnect", type: lndconnectUrlVisible ? "text" : "password", autoComplete: "new-password", label: t("rest_url.label"), placeholder: t("rest_url.placeholder"), onChange: handleLndconnectUrl, required: true, autoFocus: true, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                            setLndconnectUrlVisible(passwordView);
                        } }) }) }), formData.url.match(/\.onion/i) && ((0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(CompanionDownloadInfo_1.default, { hasTorCallback: (hasTor) => {
                        setHasTorSupport(hasTor);
                    } }) }))] }));
}
exports.default = ConnectStartOS;
