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
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const albyhub_svg_1 = __importDefault(require("/static/assets/icons/albyhub.svg"));
function ConnectAlbyHub() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.albyhub",
    });
    const [formData, setFormData] = (0, react_1.useState)({
        nostrWalletConnectUrl: "",
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function getConnectorType() {
        return "nwc";
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const { nostrWalletConnectUrl } = formData;
            const account = {
                name: "Alby Hub",
                config: {
                    nostrWalletConnectUrl,
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
                    console.error(validation);
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error }));
                }
            }
            catch (e) {
                console.error(e);
                let message = t("page.errors.connection_failed");
                if (e instanceof Error) {
                    message += `\n\n${e.message}`;
                }
                Toast_1.default.error(message);
            }
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsx)(ConnectorForm_1.default, { title: (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold dark:text-white", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "title", t: t }) }), description: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.instructions", t: t, components: [
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("a", { target: "_blank", rel: "noreferrer", className: "underline", href: "https://nwc.getalby.com" }),
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("a", { target: "_blank", rel: "noreferrer", className: "underline", href: "https://apps.umbrel.com/app/alby-nostr-wallet-connect" }),
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("a", { target: "_blank", rel: "noreferrer", className: "underline", href: "https://www.mutinywallet.com" }),
            ] }), logo: albyhub_svg_1.default, submitLoading: loading, submitDisabled: formData.nostrWalletConnectUrl === "", onSubmit: handleSubmit, children: (0, jsx_runtime_1.jsx)("div", { className: "mt-4 mb-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "nostrWalletConnectUrl", label: t("page.url.label"), placeholder: t("page.url.placeholder"), required: true, onChange: handleChange, autoFocus: true }) }) }));
}
exports.default = ConnectAlbyHub;
