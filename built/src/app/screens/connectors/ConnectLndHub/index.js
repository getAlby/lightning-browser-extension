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
const QrcodeScanner_1 = __importDefault(require("@components/QrcodeScanner"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const lndhub_go_png_1 = __importDefault(require("/static/assets/icons/lndhub_go.png"));
function ConnectLndHub() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.lndhub_go",
    });
    const [formData, setFormData] = (0, react_1.useState)({
        uri: "",
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasTorSupport, setHasTorSupport] = (0, react_1.useState)(false);
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function getConnectorType() {
        if (formData.uri.match(/\.onion/i) && !hasTorSupport) {
            return "nativelndhub";
        }
        // default to LndHub
        return "lndhub";
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const match = formData.uri.match(/lndhub:\/\/(\S+):(\S+)@(\S+)/i);
            if (!match) {
                Toast_1.default.error(t("errors.invalid_uri"));
                setLoading(false);
                return;
            }
            const login = match[1];
            const password = match[2];
            const url = match[3].replace(/\/$/, "");
            const account = {
                name: "LNDHub",
                config: {
                    login,
                    password,
                    url,
                },
                connector: getConnectorType(),
            };
            try {
                let validation;
                // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
                if (account.connector === "nativelndhub") {
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
                    else {
                        console.error("Failed to add account", addResult);
                        throw new Error(addResult.error);
                    }
                }
                else {
                    console.error(validation);
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error }));
                }
            }
            catch (e) {
                console.error(e);
                let message = t("errors.connection_failed");
                if (e instanceof Error) {
                    message += `\n\n${e.message}`;
                }
                Toast_1.default.error(message);
            }
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: t("page.title"), description: t("page.description"), logo: lndhub_go_png_1.default, submitLoading: loading, submitDisabled: formData.uri === "", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "uri", label: t("uri.label"), required: true, placeholder: "lndhub://...", pattern: "lndhub://.+", title: "lndhub://...", value: formData.uri, onChange: handleChange, autoFocus: true }) }), formData.uri.match(/\.onion/i) && ((0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsx)(CompanionDownloadInfo_1.default, { hasTorCallback: (hasTor) => {
                        setHasTorSupport(hasTor);
                    } }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-center my-6 dark:text-white", children: "OR" }), (0, jsx_runtime_1.jsx)(QrcodeScanner_1.default, { fps: 10, qrbox: 250, qrCodeSuccessCallback: (decodedText) => {
                            if (formData.uri !== decodedText) {
                                setFormData(Object.assign(Object.assign({}, formData), { uri: decodedText }));
                            }
                        }, qrCodeErrorCallback: console.error })] })] }));
}
exports.default = ConnectLndHub;
