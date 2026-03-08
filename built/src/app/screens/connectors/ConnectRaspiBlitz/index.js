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
const raspiblitz_png_1 = __importDefault(require("/static/assets/icons/raspiblitz.png"));
const initialFormData = Object.freeze({
    url: "",
    macaroon: "",
});
function ConnectRaspiBlitz() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.raspiblitz",
    });
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasTorSupport, setHasTorSupport] = (0, react_1.useState)(false);
    const [macaroonVisible, setMacaroonVisible] = (0, react_1.useState)(false);
    function handleUrl(event) {
        let url = event.target.value.trim();
        if (url.substring(0, 4) !== "http") {
            url = `https://${url}`;
        }
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: url }));
    }
    function handleMacaroon(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
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
                name: "RaspiBlitz",
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
                    (0, jsx_runtime_1.jsx)("a", { className: "underline", href: "https://raspiblitz.org/" }),
                ] }) }), description: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.instructions1", t: t, components: [
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("strong", {}),
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("br", {}),
            ] }), logo: raspiblitz_png_1.default, submitLoading: loading, submitDisabled: formData.url === "" || formData.macaroon === "", onSubmit: handleSubmit, video: "https://cdn.getalby-assets.com/connector-guides/in_extension_guide_raspiblitz.mp4", children: [(0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "url", label: t("rest_api_host.label"), placeholder: t("rest_api_host.placeholder"), onChange: handleUrl, required: true, autoFocus: true }) }), formData.url.match(/\.onion/i) && ((0, jsx_runtime_1.jsx)(CompanionDownloadInfo_1.default, { hasTorCallback: (hasTor) => {
                    setHasTorSupport(hasTor);
                } })), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-6 text-gray-500 mt-6 dark:text-neutral-400", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.instructions2", t: t, components: [
                                // eslint-disable-next-line react/jsx-key
                                (0, jsx_runtime_1.jsx)("b", {}),
                                // eslint-disable-next-line react/jsx-key
                                (0, jsx_runtime_1.jsx)("br", {}),
                            ] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "macaroon", type: macaroonVisible ? "text" : "password", autoComplete: "new-password", label: "Macaroon (HEX format)", value: formData.macaroon, onChange: handleMacaroon, required: true, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                    setMacaroonVisible(passwordView);
                                } }) }) })] })] }));
}
exports.default = ConnectRaspiBlitz;
