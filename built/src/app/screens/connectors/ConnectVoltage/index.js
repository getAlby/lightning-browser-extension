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
const ConnectorForm_1 = __importDefault(require("@components/ConnectorForm"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const voltage_png_1 = __importDefault(require("/static/assets/icons/voltage.png"));
const initialFormData = {
    url: "",
    macaroon: "",
};
function ConnectVoltage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.voltage",
    });
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [macaroonVisible, setMacaroonVisible] = (0, react_1.useState)(false);
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function getConnectorType() {
        return "lnd";
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const { url, macaroon } = formData;
            const account = {
                name: "Voltage",
                config: {
                    macaroon,
                    url,
                },
                connector: getConnectorType(),
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
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error, link: formData.url }), 
                    // Don't auto-close
                    { duration: 100000 });
                }
            }
            catch (e) {
                console.error(e);
                let message = "";
                if (e instanceof Error) {
                    message += `${e.message}`;
                }
                Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: message, link: `${formData.url}/v1/getinfo` }));
            }
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: t("page.title"), description: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.description", t: t, components: [
                (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { href: "https://www.getalby.com/voltage", target: "_blank", rel: "noreferrer noopener" }, "link"),
            ] }), logo: voltage_png_1.default, submitLoading: loading, submitDisabled: formData.url === "" || formData.macaroon === "", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("div", { className: "my-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "url", label: t("url.label"), placeholder: t("url.placeholder"), pattern: "https?://.+", title: t("url.placeholder"), onChange: handleChange, required: true, autoFocus: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "macaroon", type: macaroonVisible ? "text" : "password", autoComplete: "new-password", label: t("macaroon.label"), value: formData.macaroon, onChange: handleChange, required: true, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                            setMacaroonVisible(passwordView);
                        } }) }) })] }));
}
exports.default = ConnectVoltage;
